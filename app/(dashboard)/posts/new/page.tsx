import { PostEditor } from '@/app/(dashboard)/_components/PostEditor';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '../../utils/auth';

export default async function NewPostPage() {
  try {
    const user = await getCurrentUser();
    
    const author = {
      id: user.uid,
      name: user.displayName || 'Anonymous',
      image: user.photoURL || '/placeholder-avatar.jpg',
    };

    return (
      <div className="container max-w-4xl py-8">
        <PostEditor author={author} />
      </div>
    );
  } catch (error) {
    redirect('/sign-in');
  }
}
