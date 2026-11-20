// Hero Section Types

export type THeroVideoButton = {
    enabled: boolean;
    text: string;
    redirect_route: string;
};

export type THeroVideoItem = {
    _id: string;
    video_url: string;
    thumbnail_url?: string;
    position: number;
    title: string;
    button: THeroVideoButton;
};
