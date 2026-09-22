import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X, Video as VideoIcon } from "lucide-react";
import { uploadDirectToCloudinary } from "@/lib/cloudinary-upload";

interface MediaUploadProps {
    value: string;
    mediaType: "image" | "video";
    onChange: (url: string) => void;
}

export function MediaUpload({ value, mediaType, onChange }: MediaUploadProps) {
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();

    const maxSizeMb = mediaType === "video" ? 100 : 10;

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > maxSizeMb * 1024 * 1024) {
            toast({
                title: "File too large",
                description: `${mediaType === "video" ? "Video" : "Image"} must be less than ${maxSizeMb}MB`,
                variant: "destructive",
            });
            return;
        }

        setUploading(true);
        try {
            const url = await uploadDirectToCloudinary(file, mediaType);
            onChange(url);
            toast({
                title: "Success",
                description: `${mediaType === "video" ? "Video" : "Image"} uploaded successfully`,
            });
        } catch (error: any) {
            console.error("❌ Upload error:", error);
            toast({
                title: "Error",
                description: error?.message || "Failed to upload",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4 w-full">
            <div className="flex items-center gap-4">
                {value ? (
                    <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-primary/20 bg-black">
                        {mediaType === "video" ? (
                            <video src={value} className="w-full h-full object-cover" muted />
                        ) : (
                            <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
                        )}
                        <button
                            onClick={() => onChange("")}
                            className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 transition-opacity"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center w-40 h-40 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
                        {mediaType === "video" ? (
                            <VideoIcon className="h-8 w-8 text-muted-foreground mb-2" />
                        ) : (
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        )}
                        <span className="text-xs text-muted-foreground">No {mediaType}</span>
                    </div>
                )}

                <div className="flex-1">
                    <Input
                        type="file"
                        accept={mediaType === "video" ? "video/*" : "image/*"}
                        onChange={handleUpload}
                        disabled={uploading}
                        className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                        {mediaType === "video"
                            ? `MP4, MOV or WebM (Max ${maxSizeMb}MB)`
                            : `PNG, JPG or WebP (Max ${maxSizeMb}MB)`}
                    </p>
                </div>
            </div>

            {uploading && (
                <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading to Cloudinary...
                </div>
            )}
        </div>
    );
}
