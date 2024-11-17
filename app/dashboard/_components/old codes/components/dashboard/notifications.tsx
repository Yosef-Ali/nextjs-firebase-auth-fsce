"use client"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BellIcon, User2Icon } from "lucide-react"
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

const NotificationsComponent: React.FC = () => {
  const unreadNotifications = useQuery(api.notifications.getUnreadUserCreatedNotifications);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const handleMarkAsRead = async (id: Id<"notifications">) => {
    await markAsRead({ id });
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          {unreadNotifications && unreadNotifications.length > 0 && (
            <Badge className="absolute top-1 -right-1 h-4 min-w-[1rem] rounded-full bg-red-500 px-1 text-xs font-medium text-white">
              {unreadNotifications.length}
            </Badge>
          )}
          <BellIcon className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium">Notifications</h4>
          <Button onClick={handleMarkAllAsRead} className="text-sm text-primary" variant="link">
            Mark all as read
          </Button>
        </div>
        <div className="space-y-4">
          {unreadNotifications && unreadNotifications.map((notification) => (
            <div key={notification._id} className="flex items-start gap-3" onClick={() => handleMarkAsRead(notification._id)}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/10 text-primary">
                <User2Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="text-sm text-muted-foreground">{new Date(notification._creationTime).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default NotificationsComponent;