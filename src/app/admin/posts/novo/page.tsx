import PostForm from '@/components/PostForm';

export const metadata = { title: 'Novo post' };

export default function NewPostPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Novo post</h1>
      <PostForm mode="create" />
    </div>
  );
}
