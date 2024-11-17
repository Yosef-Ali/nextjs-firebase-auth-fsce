
import { ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { BreadcrumbNavigation } from "./breadcrumb-navigation";
import { PostDetailsForm } from "./post-details-form";
import { PostStatusSelect } from "./form/post-status-select";
import { ImageUploaderCard } from "./image-uploader-card";

interface PostFormLayoutProps {
    title: string;
    mode: "add" | "edit";
    post?: any;
    onBack: () => void;
    onImagesChange?: (images: string[]) => void;
    initialImages?: string[];
}

export const PostFormLayout: React.FC<PostFormLayoutProps> = ({
    title,
    mode,
    post,
    onBack,
    onImagesChange,
    initialImages = [],
}) => {
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40 flex-1 overflow-y-auto pt-14 lg:pt-[60px]">
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <BreadcrumbNavigation />
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={onBack}>
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">Back</span>
                            </Button>
                            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                                {title}
                            </h1>
                        </div>
                        <div className="grid gap-4 lg:grid-cols-3 md:gap-8">
                            <div className="grid auto-rows-max items-start gap-4 lg:col-span-1 lg:order-2">
                                <PostStatusSelect
                                    initialStatus={post?.status || "draft"}
                                    onStatusChange={(status) => console.log(status)}
                                />
                                <ImageUploaderCard
                                    onImagesChange={onImagesChange}
                                    maxImages={3}
                                    initialImages={initialImages}
                                />
                            </div>
                            <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:order-1">
                                <PostDetailsForm post={post} mode={mode} />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};