import { redirect } from 'next/navigation';

export default function TagsPage() {
  // Redirect to articles page since tags are part of articles
  redirect('/articles');
}
