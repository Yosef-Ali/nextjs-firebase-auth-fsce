import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Editor } from '@/components/editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Category } from '@/app/types/category';
import { UseFormReturn } from 'react-hook-form';
import { PostFormData } from './PostForm';
import { ImageUpload } from '@/components/ui/image-upload';
import { PostImagesField } from './PostImagesField';
import { MouseEvent, KeyboardEvent } from 'react';

interface PostFormFieldsProps {
    form: UseFormReturn<PostFormData>;
    categories: Category[];
    onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    titleValue: string;
}

export default function PostFormFields({ form, categories, onTitleChange, titleValue }: PostFormFieldsProps) {
    // Function to stop event propagation
    const handleInputInteraction = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.stopPropagation();
    };

    return (
        <div
            className="space-y-8"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
        >
            <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="Post title"
                                value={titleValue}
                                onChange={onTitleChange}
                                onClick={handleInputInteraction}
                                onKeyDown={handleInputInteraction}
                                onMouseDown={handleInputInteraction}
                                autoComplete="off"
                                className="w-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="post-url-slug"
                                {...field}
                                onClick={handleInputInteraction}
                                onKeyDown={handleInputInteraction}
                                onMouseDown={handleInputInteraction}
                                autoComplete="off"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                            <Select
                                value={field.value}
                                onValueChange={(value) => {
                                    // Normalize category ID before setting
                                    field.onChange(value.toLowerCase().trim());
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Deduplicate categories and normalize IDs */}
                                    {Array.from(
                                        new Map(
                                            categories
                                                .filter(category => category?.id && category?.name)
                                                .map(category => {
                                                    const normalizedId = category.id.toLowerCase().trim();
                                                    return [normalizedId, {
                                                        ...category,
                                                        id: normalizedId,
                                                        name: category.name.trim()
                                                    }];
                                                })
                                        ).values()
                                    ).map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Cover Image</FormLabel>
                        <FormControl>
                            <ImageUpload
                                value={field.value ? [field.value] : []}
                                disabled={false}
                                onChange={(url) => field.onChange(url)}
                                onRemove={() => field.onChange("")}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                            <Editor
                                value={field.value}
                                onChange={field.onChange}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Excerpt</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Brief description of the post"
                                className="min-h-[100px]"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Additional Images</FormLabel>
                        <FormControl>
                            <PostImagesField
                                form={form}  // Pass the entire form object
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                <FormField
                    control={form.control}
                    name="published"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                    Published
                                </FormLabel>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="sticky"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                    Sticky Post
                                </FormLabel>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}
