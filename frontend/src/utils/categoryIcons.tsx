import {Tv, Camera, Video, Wifi, HardDrive, Router, Cable, Plug, Radio, ShieldCheck,
    Phone, Monitor, Speaker, Gamepad2, Box}  from "lucide-react";

export const getCategoryIcon = (name: string) => {
    const category = name.toLowerCase().trim();

    switch (category) {
        case "رسيفرات":
            return Tv;

        case "كاميرات انترنت نظام ip":
            return Wifi;

        case "كاميرات المراقبة analog":
            return Camera;

        case "إشتراكات":
            return Video;

        case "ptz cameras":
            return Camera;

        case "dvr":
            return HardDrive;

        case "nvr":
            return HardDrive;

        case "power supply":
            return Plug;

        case "poe swtiches":
            return Router;

        case "كوابل":
            return Cable;

        case "connector":
            return Plug;

        case "wifi cameras":
            return Wifi;

        case "intercom":
            return Radio;

        case "access control":
            return ShieldCheck;

        case "اقراص تخزين":
            return HardDrive;

        case "router":
            return Router;

        case "hdmi device":
            return Monitor;

        case "bracket":
            return Box;

        case "اكسسوارات هاتف":
            return Phone;

        case "اكسسوارات كومبيوتر":
            return Monitor;

        case "سماعات":
            return Speaker;

        case "remote":
            return Gamepad2;

        default:
            return Box;
    }
};

export const getCategoryDescription = (name: string) => {
    const category = name.toLowerCase().trim();

    switch (category) {
        case "رسيفرات":
            return "جميع أنواع الرسيفرات بأحدث التقنيات";

        case "كاميرات انترنت نظام ip":
            return "كاميرات مراقبة ذكية عالية الدقة";

        case "كاميرات المراقبة analog":
            return "كاميرات تقليدية بجودة ممتازة";

        case "إشتراكات":
            return "أفضل العروض والاشتراكات الرقمية";

        default:
            return "أفضل المنتجات بأفضل الأسعار";
    }
};