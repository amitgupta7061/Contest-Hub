import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {prisma} from '@/lib/prisma';

// GET - Fetch all notifications for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Delete expired notifications (contest has ended)
    await prisma.contestNotification.deleteMany({
      where: {
        userId: user.id,
        contestEndTime: {
          lt: new Date()
        }
      }
    });

    // Get all active notifications (contest hasn't ended yet)
    const notifications = await prisma.contestNotification.findMany({
      where: { 
        userId: user.id,
        contestEndTime: {
          gte: new Date() // Only get contests that haven't ended yet
        }
      },
      orderBy: { contestStartTime: 'asc' },
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new notification
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      contestId,
      contestName,
      contestPlatform,
      contestUrl,
      contestStartTime,
      contestEndTime,
      notifyViaEmail,
      notifyViaWhatsapp,
      email,
      whatsappNumber,
    } = body;

    // Check if notification already exists
    const existingNotification = await prisma.contestNotification.findUnique({
      where: {
        userId_contestId: {
          userId: user.id,
          contestId,
        },
      },
    });

    if (existingNotification) {
      // Update existing notification
      const updated = await prisma.contestNotification.update({
        where: { id: existingNotification.id },
        data: {
          notifyViaEmail,
          notifyViaWhatsapp,
          email,
          whatsappNumber,
        },
      });
      return NextResponse.json({ notification: updated, updated: true });
    }

    // Create new notification
    const notification = await prisma.contestNotification.create({
      data: {
        contestId,
        contestName,
        contestPlatform,
        contestUrl,
        contestStartTime: new Date(contestStartTime),
        contestEndTime: new Date(contestEndTime),
        notifyViaEmail,
        notifyViaWhatsapp,
        email,
        whatsappNumber,
        userId: user.id,
      },
    });

    return NextResponse.json({ notification, created: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a notification
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json({ message: 'Notification ID required' }, { status: 400 });
    }

    // Verify the notification belongs to the user
    const notification = await prisma.contestNotification.findFirst({
      where: {
        id: notificationId,
        userId: user.id,
      },
    });

    if (!notification) {
      return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
    }

    await prisma.contestNotification.delete({
      where: { id: notificationId },
    });

    return NextResponse.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
