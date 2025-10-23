// you can add more to the PageMetaData type (such as Open Graph data) to be consumed by your PageTemplate component
export interface PageMetaData {
    url: string; // required by plugin
    bundleEntryPoint: string; // required by plugin
    title: string;
    description: string;
}

// here you will list all your pages and their needed meta data.
export const pages: PageMetaData[] = [
    {
        url: "index.html",
        bundleEntryPoint: "/src/main.tsx",
        title: "ExpoPass 展覽通行證管理系統",
        description:
            "一個現代化的展覽活動管理系統，提供 QR Code 掃描、參展人員管理、攤位管理及數據分析功能。",
    },
];
