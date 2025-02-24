import { fixCategories } from '@/app/actions/fix-categories';

export async function POST(request: Request) {
    const result = await fixCategories();
    return Response.json(result);
}