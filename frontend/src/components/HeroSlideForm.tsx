import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type HeroSlide = {
    _id?: string;
    title: string;
    subtitle: string;
    image: string;
    order: number;
    isActive: boolean;
};

type HeroSlideFormProps = {
    slide?: HeroSlide;
    onSave: (slideData: any) => void;
    onCancel: () => void;
};

export default function HeroSlideForm({slide, onSave, onCancel,}: HeroSlideFormProps) {
    const [formData, setFormData] = useState({
        title: slide?.title || "",
        subtitle: slide?.subtitle || "",
        image: slide?.image || "",
        order: slide?.order || 0,
        isActive: slide?.isActive ?? true,
    });

    const [imagePreview, setImagePreview] = useState<string>(slide?.image || "");
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);

            const storageRef = ref(storage, `hero-slides/${Date.now()}-${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                () => {},
                () => {
                    toast({
                        title: "خطأ",
                        description: "فشل رفع الصورة",
                        variant: "destructive",
                    });
                    setUploading(false);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setImagePreview(downloadURL);
                    setFormData((prev) => ({
                        ...prev,
                        image: downloadURL,
                    }));
                    setUploading(false);
                }
            );
        } catch (error) {
            setUploading(false);
            toast({
                title: "خطأ",
                description: "حدث خطأ أثناء رفع الصورة",
                variant: "destructive",
            });
        }
    };

    const removeImage = () => {
        setImagePreview("");
        setFormData((prev) => ({
            ...prev,
            image: "",
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title) {
            toast({
                title: "خطأ",
                description: "يرجى إدخال عنوان السلايد",
                variant: "destructive",
            });
            return;
        }

        if (!formData.image) {
            toast({
                title: "خطأ",
                description: "يرجى رفع صورة",
                variant: "destructive",
            });
            return;
        }

        onSave({
            ...formData,
            id: slide?._id,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label>العنوان</Label>
                <Input
                    value={formData.title}
                    onChange={(e) =>
                        setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                />
            </div>

            <div>
                <Label>العنوان الفرعي</Label>
                <Input
                    value={formData.subtitle}
                    onChange={(e) =>
                        setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
                    }
                />
            </div>

            <div>
                <Label>الترتيب</Label>
                <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            order: Number(e.target.value),
                        }))
                    }
                />
            </div>

            <div className="flex items-center gap-3">
                <Label>نشط</Label>
                <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, isActive: checked }))
                    }
                />
            </div>

            <div>
                <Label>الصورة</Label>
                <Input type="file" accept="image/*" onChange={handleImageUpload} />
            </div>

            {imagePreview && (
                <div className="space-y-2">
                    <img
                        src={imagePreview}
                        alt="preview"
                        className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button type="button" variant="destructive" onClick={removeImage}>
                        حذف الصورة
                    </Button>
                </div>
            )}

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    إلغاء
                </Button>
                <Button type="submit" disabled={uploading}>
                    {uploading ? "جاري رفع الصورة..." : "حفظ"}
                </Button>
            </div>
        </form>
    );
}