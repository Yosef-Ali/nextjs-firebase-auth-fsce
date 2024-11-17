import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CategoryRow } from "./category-row";
import { Category } from "@/types";

type CategoryCardProps = {
  categories: Category[];
};

export function CategoryCard({ categories }: CategoryCardProps) {
  return (
    <Card>
      <CardHeader className="px-7">
        <CardTitle>Categories</CardTitle>
        <CardDescription>All categories from your site.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="hidden md:table-cell">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <CategoryRow key={category._id} category={category} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
