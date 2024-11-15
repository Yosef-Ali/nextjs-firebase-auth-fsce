import { getCurrentUser } from '@/app/(dashboard)/utils/auth';
import { redirect } from 'next/navigation';
import { marketingService } from '@/app/(marketing)/services/firebase/marketing';
import { PostsTable } from '@/app/(dashboard)/_components/PostsTable';

export default async function PostsPage() {
  try {
    const user = await getCurrentUser();
    const posts = await marketingService.getUserPosts(user.uid);
    console.log('posts', posts);
    console.log('user', user);

    return (
      <div className="container py-8">

        <p>Title is here</p>
        <PostsTable initialPosts={posts} />
      </div>
    );
  } catch (error) {
    redirect('/sign-in');
  }
}