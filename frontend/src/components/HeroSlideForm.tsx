import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from '@/hooks/use-toast';

type HeroSlide = {
    _id?: string;
    title: string;
    subtitle: string;
    image: string;
    mobileImage?: string;
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
        mobileImage: slide?.mobileImage || "",
        order: slide?.order || 0,
        isActive: slide?.isActive ?? true,
    });

    const [desktopPreview, setDesktopPreview] = useState<string>(slide?.image || "");
    const [mobilePreview, setMobilePreview] = useState<string>(slide?.mobileImage || "");

    const [uploadingDesktop, setUploadingDesktop] = useState(false);
    const [uploadingMobile, setUploadingMobile] = useState(false);

    const uploadImageToFirebase = async (
        file: File,
        folder: string
    ): Promise<string> => {
        return new Promise((resolve, reject) => {
            const storageRef = ref(storage, `${folder}/${Date.now()}-${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                () => {},
                (error) => reject(error),
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    };

    const handleDesktopImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingDesktop(true);

            const downloadURL = await uploadImageToFirebase(file, "hero-slides/desktop");

            setDesktopPreview(downloadURL);
            setFormData((prev) => ({
                ...prev,
                image: downloadURL,
            }));
        } catch (error) {
            toast({
                title: "خطأ",
                description: "فشل رفع صورة الديسكتوب",
                variant: "destructive",
            });
        } finally {
            setUploadingDesktop(false);
            e.target.value = "";
        }
    };

    const handleMobileImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingMobile(true);

            const downloadURL = await uploadImageToFirebase(file, "hero-slides/mobile");

            setMobilePreview(downloadURL);
            setFormData((prev) => ({
                ...prev,
                mobileImage: downloadURL,
            }));
        } catch (error) {
            toast({
                title: "خطأ",
                description: "فشل رفع صورة الموبايل",
                variant: "destructive",
            });
        } finally {
            setUploadingMobile(false);
            e.target.value = "";
        }
    };

    const removeDesktopImage = () => {
        setDesktopPreview("");
        setFormData((prev) => ({
            ...prev,
            image: "",
        }));
    };

    const removeMobileImage = () => {
        setMobilePreview("");
        setFormData((prev) => ({
            ...prev,
            mobileImage: "",
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
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
                description: "يرجى رفع صورة الديسكتوب",
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
        <form onSubmit={handleSubmit} className="space-y-5">
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

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                    <Label>صورة الديسكتوب</Label>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleDesktopImageUpload}
                    />

                    {uploadingDesktop && (
                        <p className="text-sm text-gray-500">جاري رفع صورة الديسكتوب...</p>
                    )}

                    {desktopPreview ? (
                        <div className="space-y-2">
                            <img
                                src={desktopPreview}
                                alt="desktop preview"
                                className="w-full h-44 object-cover rounded-lg border"
                            />
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={removeDesktopImage}
                                >
                                    حذف صورة الديسكتوب
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">لم يتم رفع صورة ديسكتوب بعد</p>
                    )}
                </div>

                <div className="space-y-3">
                    <Label>صورة الموبايل</Label>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleMobileImageUpload}
                    />

                    {uploadingMobile && (
                        <p className="text-sm text-gray-500">جاري رفع صورة الموبايل...</p>
                    )}

                    {mobilePreview ? (
                        <div className="space-y-2">
                            <img
                                src={mobilePreview}
                                alt="mobile preview"
                                className="w-full h-44 object-cover rounded-lg border"
                            />
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={removeMobileImage}
                                >
                                    حذف صورة الموبايل
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">
                            اختياري: يمكن رفع صورة مخصصة للموبايل
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    إلغاء
                </Button>
                <Button
                    type="submit"
                    disabled={uploadingDesktop || uploadingMobile}
                >
                    {uploadingDesktop || uploadingMobile ? "جاري رفع الصور..." : "حفظ"}
                </Button>
            </div>
        </form>
    );
}