import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendContestReminderEmail } from '@/lib/email';

// This endpoint is called by Vercel Cron every 15 minutes
// It checks for contests starting in the next hour and sends reminder emails

export async function GET(req: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    // Find notifications where:
    // 1. Contest starts within the next hour (but not already started)
    // 2. Email notification is enabled
    // 3. Email hasn't been sent yet
    const pendingNotifications = await prisma.contestNotification.findMany({
      where: {
        notifyViaEmail: true,
        emailSent: false,
        email: { not: null },
        contestStartTime: {
          gte: now,
          lte: oneHourFromNow,
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`Found ${pendingNotifications.length} pending email notifications`);

    const results = {
      total: pendingNotifications.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Send emails for each pending notification
    for (const notification of pendingNotifications) {
      try {
        if (!notification.email) continue;

        await sendContestReminderEmail(notification.email, {
          contestName: notification.contestName,
          contestPlatform: notification.contestPlatform,
          contestUrl: notification.contestUrl,
          contestStartTime: notification.contestStartTime,
          userName: notification.user.name || undefined,
        });

        // Mark email as sent
        await prisma.contestNotification.update({
          where: { id: notification.id },
          data: { emailSent: true },
        });

        results.sent++;
        console.log(`Email sent to ${notification.email} for contest: ${notification.contestName}`);
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Failed to send to ${notification.email}: ${errorMessage}`);
        console.error(`Failed to send email to ${notification.email}:`, error);
      }
    }

    // Clean up old notifications (contests that have ended)
    const deleted = await prisma.contestNotification.deleteMany({
      where: {
        contestEndTime: {
          lt: now,
        },
      },
    });

    console.log(`Cleaned up ${deleted.count} expired notifications`);

    return NextResponse.json({
      success: true,
      message: `Processed ${results.total} notifications`,
      results: {
        ...results,
        cleanedUp: deleted.count,
      },
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
