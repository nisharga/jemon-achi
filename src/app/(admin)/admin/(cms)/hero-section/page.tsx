'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    Loader2,
    Plus,
    Trash2,
    GripVertical,
    RefreshCcw,
    Upload,
    X
} from 'lucide-react';

import {
    useGetHeroSectionQuery,
    useUpsertHeroSectionMutation,
    useDeleteHeroVideoMutation
} from '@/admin/redux/api-queries/herosection-api';
import { useUploadFileToAWSMutation } from '@/admin/redux/api-queries/file-upload-api';
import { THeroVideoItem, THeroVideoButton } from '@/admin/types/hero-section';

import { Button } from '@/admin/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/admin/components/ui/card';
import { Input } from '@/admin/components/ui/input';
import { Switch } from '@/admin/components/ui/switch';
import { Label } from '@/admin/components/ui/label';
import { Skeleton } from '@/admin/components/ui/skeleton';
import { useHasPermission } from '@/admin/hooks/use-has-permission';
import { PermissionEnum } from '@/admin/types/permistion';
import { PermissionErrorCard } from '@/admin/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/admin/components/shared/permission-loader-card';
import { ImageUploadInput } from '@/admin/components/ui/image-upload-input';
import { VideoUploadInput } from '@/admin/components/ui/video-upload-input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/admin/components/ui/select';
import { getImgFullUrl } from '@/admin/lib/utils';

type TVideoForm = {
    _id?: string;
    video_file?: File | string;
    video_url?: string;
    fallback_image_url?: string;
    fallback_image_file?: File | string;
    position: number;
    title: string;
    button: THeroVideoButton;
};

const DEFAULT_VIDEO_FORM: TVideoForm = {
    position: 1,
    title: '',
    button: {
        enabled: false,
        text: '',
        redirect_route: ''
    }
};

const AVAILABLE_POSITIONS = [1, 2, 3];

const HeroSectionPage = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [
            PermissionEnum.CMS_VIEW,
            PermissionEnum.CMS_CREATE,
            PermissionEnum.CMS_UPDATE,
            PermissionEnum.CMS_DELETE
        ]
    });

    // === API hooks ===
    const {
        data: heroSectionData,
        isLoading: isHeroLoading,
        refetch
    } = useGetHeroSectionQuery({});
    const [upsertHeroSection, { isLoading: isSaving }] =
        useUpsertHeroSectionMutation();
    const [deleteHeroVideo] = useDeleteHeroVideoMutation();
    const [uploadFile] = useUploadFileToAWSMutation();

    // === UI state ===
    const [videos, setVideos] = useState<TVideoForm[]>([DEFAULT_VIDEO_FORM]);
    const [isUploading, setIsUploading] = useState(false);

    // Hydrate form from API data
    useEffect(() => {
        if (heroSectionData?.data?.length) {
            const formatted = heroSectionData.data.map((v: THeroVideoItem) => ({
                _id: v._id,
                video_url: v.video_url || '',
                fallback_image_url: v.thumbnail_url || '',
                position: v.position,
                title: v.title || '',
                button: v.button || DEFAULT_VIDEO_FORM.button
            }));
            setVideos(formatted);
        }
    }, [heroSectionData]);

    // === Handlers ===

    const handleAddVideo = () => {
        if (videos.length >= 3) {
            toast.error('Maximum 3 videos allowed');
            return;
        }

        // Find the next available position
        const usedPositions = videos.map((v) => v.position);
        const nextPosition = AVAILABLE_POSITIONS.find(
            (p) => !usedPositions.includes(p)
        );

        if (!nextPosition) {
            toast.error(
                'All positions are occupied. Please remove or reposition a video first.'
            );
            return;
        }

        setVideos([
            ...videos,
            {
                ...DEFAULT_VIDEO_FORM,
                position: nextPosition
            }
        ]);
    };

    const handleRemoveVideo = async (index: number) => {
        const video = videos[index];
        if (!video._id) {
            // New video, just remove from state
            setVideos(videos.filter((_, i) => i !== index));
            return;
        }

        // Existing video, call delete API
        try {
            const res: any = await deleteHeroVideo({
                videoId: video._id
            }).unwrap();
            if (res?.success) {
                toast.success(res?.message || 'Video deleted successfully');
                setVideos(videos.filter((_, i) => i !== index));
            }
        } catch (e: any) {
            toast.error(e?.data?.message || 'Failed to delete video');
        }
    };

    const handleUploadFile = async (
        file: File
    ): Promise<string | undefined> => {
        // const formData = new FormData();
        // formData.append("file", file);

        try {
            setIsUploading(true);
            const res: any = await uploadFile(file);
            console.log(res);
            if (res?.data?.success) {
                return res?.data?.data?.url;
            }
        } catch (e) {
            toast.error('Failed to upload file');
            console.log(e);
            return undefined;
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveAll = async () => {
        // Validate
        const usedPositions = videos.map((v) => v.position);
        const uniquePositions = new Set(usedPositions);
        if (usedPositions.length !== uniquePositions.size) {
            toast.error('Each video must have a unique position (1-3)');
            return;
        }

        for (let i = 0; i < videos.length; i++) {
            const video = videos[i];

            // Check if video is present (either new file or existing URL)
            if (!video.video_file && !video.video_url) {
                toast.error(`Video is required for position ${video.position}`);
                return;
            }

            if (!video.title) {
                toast.error(
                    `Title is required for video at position ${video.position}`
                );
                return;
            }
            if (video.button.enabled) {
                if (!video.button.text) {
                    toast.error(
                        `Button text is required when button is enabled (position ${video.position})`
                    );
                    return;
                }
                if (!video.button.redirect_route) {
                    toast.error(
                        `Redirect route is required when button is enabled (position ${video.position})`
                    );
                    return;
                }
            }
        }

        // Upload files if needed and build payload
        const processedVideos = await Promise.all(
            videos.map(async (video) => {
                let videoUrl = video.video_url;
                let fallbackImageUrl = video.fallback_image_url;

                // Upload new video file if present
                if (video.video_file instanceof File) {
                    const uploadedUrl = await handleUploadFile(
                        video.video_file
                    );
                    if (!uploadedUrl) {
                        throw new Error('Failed to upload video');
                    }
                    videoUrl = uploadedUrl;
                }

                // Upload new fallback image file if present
                if (video.fallback_image_file instanceof File) {
                    const uploadedUrl = await handleUploadFile(
                        video.fallback_image_file
                    );
                    if (!uploadedUrl) {
                        throw new Error('Failed to upload fallback image');
                    }
                    fallbackImageUrl = uploadedUrl;
                }

                return {
                    ...(video._id && { _id: video._id }),
                    video_url: videoUrl!,
                    ...(fallbackImageUrl && {
                        thumbnail_url: fallbackImageUrl
                    }),
                    position: video.position,
                    title: video.title,
                    button: video.button
                };
            })
        );

        try {
            const res: any = await upsertHeroSection({
                hero_section: processedVideos
            }).unwrap();

            if (res?.success) {
                toast.success(
                    res?.message || 'Hero section saved successfully'
                );
                refetch();
            }
        } catch (e: any) {
            toast.error(e?.data?.message || 'Failed to save hero section');
        }
    };

    const updateVideo = (index: number, updates: Partial<TVideoForm>) => {
        setVideos((prev) =>
            prev.map((v, i) => (i === index ? { ...v, ...updates } : v))
        );
    };

    const updateVideoButton = (
        index: number,
        updates: Partial<THeroVideoButton>
    ) => {
        setVideos((prev) =>
            prev.map((v, i) =>
                i === index ? { ...v, button: { ...v.button, ...updates } } : v
            )
        );
    };

    // === loading and permission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading) {
        return <PermissionLoaderCard />;
    }

    return (
        <div className='space-y-6 p-4'>
            {/* Header */}
            <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                <div>
                    <h1 className='text-xl font-semibold md:text-2xl'>
                        Hero Section Management
                    </h1>
                    <p className='text-sm text-muted-foreground'>
                        Manage hero video sliders (max 3 videos) with titles,
                        buttons, and fallback images.
                    </p>
                </div>

                <div className='flex items-center gap-2'>
                    <Button
                        variant='outline'
                        onClick={() => refetch()}
                        disabled={isHeroLoading}
                    >
                        <RefreshCcw className='mr-2 h-4 w-4' />
                        Refresh
                    </Button>

                    <Button
                        className='bg-primary text-primary-foreground hover:bg-primary/90'
                        onClick={handleSaveAll}
                        disabled={isHeroLoading || isSaving || isUploading}
                    >
                        {(isSaving || isUploading) && (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        )}
                        Save All Changes
                    </Button>
                </div>
            </div>

            {/* Videos Grid */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3'>
                {isHeroLoading
                    ? Array.from({ length: 3 }).map((_, i) => (
                          <Card key={i} className='rounded-2xl'>
                              <CardContent className='space-y-4 p-6'>
                                  <Skeleton className='h-6 w-3/4' />
                                  <Skeleton className='h-32 w-full' />
                                  <Skeleton className='h-10 w-full' />
                              </CardContent>
                          </Card>
                      ))
                    : videos.map((video, index) => (
                          <Card
                              key={video._id || index}
                              className='group relative rounded-2xl'
                          >
                              <CardHeader className='pb-4'>
                                  <div className='flex items-start justify-between gap-3'>
                                      <div className='flex items-center gap-2'>
                                          <GripVertical className='h-5 w-5 text-muted-foreground' />
                                          <CardTitle className='text-lg'>
                                              Video {video.position}
                                          </CardTitle>
                                      </div>
                                      <Button
                                          variant='ghost'
                                          size='icon'
                                          onClick={() =>
                                              handleRemoveVideo(index)
                                          }
                                          className='h-8 w-8 text-destructive hover:text-destructive'
                                      >
                                          <Trash2 className='h-4 w-4' />
                                      </Button>
                                  </div>
                                  <CardDescription>
                                      Position {video.position} •{' '}
                                      {video._id
                                          ? 'Existing video'
                                          : 'New video'}
                                  </CardDescription>
                              </CardHeader>

                              <CardContent className='space-y-4'>
                                  {/* Position Selector */}
                                  <div className='space-y-2'>
                                      <Label>Position (1-3)</Label>
                                      <Select
                                          value={String(video.position)}
                                          onValueChange={(val) =>
                                              updateVideo(index, {
                                                  position: Number(val)
                                              })
                                          }
                                      >
                                          <SelectTrigger>
                                              <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                              {AVAILABLE_POSITIONS.map(
                                                  (pos) => (
                                                      <SelectItem
                                                          key={pos}
                                                          value={String(pos)}
                                                          disabled={
                                                              pos !==
                                                                  video.position &&
                                                              videos.some(
                                                                  (v) =>
                                                                      v.position ===
                                                                      pos
                                                              )
                                                          }
                                                      >
                                                          Position {pos}
                                                      </SelectItem>
                                                  )
                                              )}
                                          </SelectContent>
                                      </Select>
                                  </div>

                                  {/* Title */}
                                  <div className='space-y-2'>
                                      <Label>Title</Label>
                                      <Input
                                          value={video.title}
                                          onChange={(e) =>
                                              updateVideo(index, {
                                                  title: e.target.value
                                              })
                                          }
                                          placeholder='Enter hero title'
                                          maxLength={200}
                                      />
                                      <p className='text-xs text-muted-foreground'>
                                          {video.title.length}/200 characters
                                      </p>
                                  </div>

                                  {/* Video Upload */}
                                  <div className='space-y-2'>
                                      <Label>Video File</Label>
                                      <VideoUploadInput
                                          inputId={`video-${index}`}
                                          defaultValue={video.video_url}
                                          onChange={(video) =>
                                              updateVideo(index, {
                                                  video_file: video
                                              })
                                          }
                                      />
                                      {video.video_url && !video.video_file && (
                                          <p className='truncate text-xs text-muted-foreground'>
                                              Current: {video.video_url}
                                          </p>
                                      )}
                                  </div>

                                  {/* Fallback Image Upload */}
                                  <div className='space-y-2'>
                                      <Label>Fallback Image (Optional)</Label>
                                      <div className='flex gap-2'>
                                          {video.fallback_image_url && (
                                              <div className='relative h-20 w-20 overflow-hidden rounded-lg border'>
                                                  <img
                                                      src={getImgFullUrl(
                                                          video.fallback_image_url
                                                      )}
                                                      alt='Fallback'
                                                      className='h-full w-full object-cover'
                                                  />
                                                  <Button
                                                      variant='destructive'
                                                      size='icon'
                                                      className='absolute top-1 right-1 h-5 w-5 p-0'
                                                      onClick={() =>
                                                          updateVideo(index, {
                                                              fallback_image_url:
                                                                  '',
                                                              fallback_image_file:
                                                                  undefined
                                                          })
                                                      }
                                                  >
                                                      <X className='h-3 w-3' />
                                                  </Button>
                                              </div>
                                          )}
                                          <div className='flex-1'>
                                              <ImageUploadInput
                                                  mode='single'
                                                  inputId={`fallback-${index}`}
                                                  onChange={(images) => {
                                                      if (images[0]) {
                                                          updateVideo(index, {
                                                              fallback_image_file:
                                                                  images[0]
                                                          });
                                                      }
                                                  }}
                                              />
                                          </div>
                                      </div>
                                      {video.fallback_image_url &&
                                          !video.fallback_image_file && (
                                              <p className='truncate text-xs text-muted-foreground'>
                                                  {video.fallback_image_url}
                                              </p>
                                          )}
                                  </div>

                                  {/* Button Configuration */}
                                  <div className='space-y-3 rounded-xl border bg-muted/20 p-4'>
                                      <div className='flex items-center justify-between'>
                                          <Label
                                              htmlFor={`button-enabled-${index}`}
                                          >
                                              Show Button
                                          </Label>
                                          <Switch
                                              id={`button-enabled-${index}`}
                                              checked={video.button.enabled}
                                              onCheckedChange={(checked) =>
                                                  updateVideoButton(index, {
                                                      enabled: checked
                                                  })
                                              }
                                          />
                                      </div>

                                      {video.button.enabled && (
                                          <>
                                              <div className='space-y-2'>
                                                  <Label>Button Text</Label>
                                                  <Input
                                                      value={video.button.text}
                                                      onChange={(e) =>
                                                          updateVideoButton(
                                                              index,
                                                              {
                                                                  text: e.target
                                                                      .value
                                                              }
                                                          )
                                                      }
                                                      placeholder='Shop Now'
                                                  />
                                              </div>

                                              <div className='space-y-2'>
                                                  <Label>Redirect Route</Label>
                                                  <Input
                                                      value={
                                                          video.button
                                                              .redirect_route
                                                      }
                                                      onChange={(e) =>
                                                          updateVideoButton(
                                                              index,
                                                              {
                                                                  redirect_route:
                                                                      e.target
                                                                          .value
                                                              }
                                                          )
                                                      }
                                                      placeholder='/products or https://example.com'
                                                  />
                                                  <p className='text-xs text-muted-foreground'>
                                                      Use internal path (e.g.,
                                                      /products) or external URL
                                                  </p>
                                              </div>
                                          </>
                                      )}
                                  </div>
                              </CardContent>
                          </Card>
                      ))}
            </div>

            {/* Add Video Button */}
            {videos.length < 3 && (
                <Card
                    className='cursor-pointer rounded-2xl border-2 border-dashed transition hover:bg-muted/20'
                    onClick={handleAddVideo}
                >
                    <CardContent className='flex flex-col items-center justify-center gap-3 p-12'>
                        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                            <Plus className='h-6 w-6 text-primary' />
                        </div>
                        <div className='text-center'>
                            <p className='font-medium'>Add New Video</p>
                            <p className='text-sm text-muted-foreground'>
                                {videos.length === 0
                                    ? 'Add your first hero video'
                                    : `${3 - videos.length} more slot(s) available`}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Info Card */}
            <Card className='rounded-2xl bg-muted/30'>
                <CardContent className='p-4'>
                    <div className='flex items-start gap-3'>
                        <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10'>
                            <Upload className='h-4 w-4 text-primary' />
                        </div>
                        <div className='space-y-1'>
                            <p className='text-sm font-medium'>Tips</p>
                            <ul className='space-y-1 text-sm text-muted-foreground'>
                                <li>
                                    • Each video must have a unique position
                                    (1-3)
                                </li>
                                <li>
                                    • Videos are displayed in order: Position 1
                                    → 2 → 3
                                </li>
                                <li>
                                    • Fallback image is shown while video loads
                                    or on devices that do not support autoplay
                                </li>
                                <li>
                                    • Button can be enabled/disabled per video
                                    independently
                                </li>
                                <li>
                                    • Redirect route supports both internal
                                    paths (/products) and external URLs
                                    (https://...)
                                </li>
                                <li>
                                    • Supported video formats: MP4, WebM, OGG
                                    (max 50MB)
                                </li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default HeroSectionPage;
