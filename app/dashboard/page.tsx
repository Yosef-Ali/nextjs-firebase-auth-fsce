'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/hooks/useAuth';
import { usersService } from '@/app/services/users';
import { Users, FileText, BookOpen, Image, HardDrive, Database, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DashboardOverviewHeader from './_components/DashboardOverviewHeader';

// Firebase Free Tier Limits
const STORAGE_LIMIT_MB = 1024; // 1GB storage
const DATABASE_LIMIT_MB = 500; // 500MB database

export default function DashboardPage() {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalResources: 0,
    totalMedia: 0,
    storageUsed: 0, // in MB
    databaseUsed: 0, // in MB,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await usersService.getAllUsers();
        // Simulated storage and database stats - replace with actual data fetching
        const mockStorageUsed = 150; // MB
        const mockDatabaseUsed = 50; // MB

        setStats(prev => ({
          ...prev,
          totalUsers: response.data?.length || 0,
          storageUsed: mockStorageUsed,
          databaseUsed: mockDatabaseUsed
        }));
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  const storagePercentage = (stats.storageUsed / STORAGE_LIMIT_MB) * 100;
  const databasePercentage = (stats.databaseUsed / DATABASE_LIMIT_MB) * 100;
  const isAdmin = true; // Allow all users access

  return (
    <div className="container mx-auto p-6 space-y-8">
      <DashboardOverviewHeader />

      <Separator />

      {!isAdmin && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You are using a free account with limited storage and media items. Upgrade to remove these limitations.
          </AlertDescription>
        </Alert>
      )}

      {isAdmin && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Free users are limited to {STORAGE_LIMIT_MB}MB storage and {DATABASE_LIMIT_MB}MB database.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalResources}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Media</CardTitle>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMedia}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              <Progress value={storagePercentage} className="h-2" />
              <p className="mt-2 text-sm text-muted-foreground">
                {stats.storageUsed}MB / {STORAGE_LIMIT_MB}MB used
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{stats.databaseUsed}MB / 500MB</div>
              <Progress
                value={databasePercentage}
                className="h-2"
                variant={databasePercentage > 80 ? "destructive" : "default"}
              />
              {databasePercentage >= 80 && (
                <p className="text-xs text-amber-500">Database usage is getting high</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {isAdmin && storagePercentage >= 80 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <p className="text-sm text-amber-700">
                Storage usage is at {storagePercentage.toFixed(1)}%. Consider optimizing storage or upgrading your plan.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isAdmin && databasePercentage >= 80 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <p className="text-sm text-amber-700">
                Database usage is at {databasePercentage.toFixed(1)}%. Consider optimizing data or upgrading your plan.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
