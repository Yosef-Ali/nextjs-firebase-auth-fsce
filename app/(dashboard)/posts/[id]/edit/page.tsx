import { PostEditor } from '@/app/(dashboard)/_components/PostEditor';
import { marketingService } from '@/app/(marketing)/services/firebase/marketing';
import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '../../../utils/auth';

interface EditPostPageProps {
  params: {
    id: string;
  };
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  try {
    const user = await getCurrentUser();
    const post = await marketingService.getPostById(params.id);
    
    if (!post) {
      notFound();
    }

    // Ensure user owns this post
    if (post.author.id !== user.uid) {
      redirect('/posts');
    }

    const author = {
      id: user.uid,
      name: user.displayName || 'Anonymous',
      image: user.photoURL || '/placeholder-avatar.jpg',
    };

    return (
      <div className="container max-w-4xl py-8">
        <PostEditor post={post} author={author} />
      </div>
    );
  } catch (error) {
    redirect('/sign-in');
  }
}
