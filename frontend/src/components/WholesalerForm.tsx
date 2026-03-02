import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

export interface User {
    _id?: string;
    userName: string;
    phone: string;
    password?: string;
    role: "admin" | "user" | "wholesaler";
    points?: number;
    dob?: string;
}

interface UserFormProps {
    user?: User;
    defaultRole?: "user" | "wholesaler";
    onSave: (user: Omit<User, "_id"> & { id?: string }) => void;
    onCancel: () => void;
}

const WholesalerForm: React.FC<UserFormProps> = ({user, defaultRole = "user", onSave, onCancel,}) => {
    const [formData, setFormData] = useState({
        userName: user?.userName || "",
        phone: user?.phone || "",
        password: "",
        role: user?.role || defaultRole,
        points: user?.points || 0,
        dob: user?.dob ? user.dob.substring(0, 10) : "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.userName || !formData.phone) {
            toast({
                title: "خطأ",
                description: "يرجى تعبئة الاسم ورقم الهاتف",
                variant: "destructive",
            });
            return;
        }

        if (!user && !formData.password) {
            toast({
                title: "خطأ",
                description: "يرجى إدخال كلمة المرور",
                variant: "destructive",
            });
            return;
        }

        const payload: any = {
            userName: formData.userName,
            phone: formData.phone,
            role: formData.role,
            points: formData.points,
            dob: formData.dob,
        };

        // Only send password if filled (important for update)
        if (formData.password) {
            payload.password = formData.password;
        }

        onSave({
            ...payload,
            id: user?._id,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    اسم المستخدم *
                </label>
                <Input
                    value={formData.userName}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            userName: e.target.value,
                        }))
                    }
                    placeholder="اسم المستخدم"
                    required
                />
            </div>

            {/* Phone */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    رقم الهاتف *
                </label>
                <Input
                    value={formData.phone}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                        }))
                    }
                    placeholder="059XXXXXXX"
                    required
                />
            </div>

            {/* Password */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    كلمة المرور {user ? "(اتركها فارغة إذا لا تريد التغيير)" : "*"}
                </label>
                <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            password: e.target.value,
                        }))
                    }
                    placeholder="كلمة المرور"
                />
            </div>

            {/* Points (only for normal users) */}
            {formData.role === "user" && (
                <div>
                    <label className="block text-sm font-medium mb-2">
                        النقاط
                    </label>
                    <Input
                        type="number"
                        value={formData.points}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                points: Number(e.target.value),
                            }))
                        }
                    />
                </div>
            )}

            {/* Date of Birth */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    تاريخ الميلاد
                </label>
                <Input
                    type="date"
                    value={formData.dob}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            dob: e.target.value,
                        }))
                    }
                />
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
                <Button
                    type="submit"
                    className="bg-heroes-red hover:bg-heroes-red/90"
                >
                    {user ? "تحديث المستخدم" : "إضافة المستخدم"}
                </Button>

                <Button type="button" variant="outline" onClick={onCancel}>
                    إلغاء
                </Button>
            </div>
        </form>
    );
};

export default WholesalerForm;