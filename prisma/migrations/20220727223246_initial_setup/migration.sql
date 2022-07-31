-- CreateEnum
CREATE TYPE "Category" AS ENUM ('TUTORIAL', 'LIVECODING', 'SOFTSKILL', 'SHOW', 'TALK', 'VLOG', 'DOCUMENTARY', 'UPDATE', 'ANNOUNCEMENT', 'NEWS', 'QANDA', 'INTERVIEW', 'REVIEW', 'PORTFOLIOREVIEW', 'OTHER', 'NONE');

-- CreateEnum
CREATE TYPE "ChannelStatus" AS ENUM ('ACTIVE', 'PAUSED', 'MODERATED', 'HIDDEN', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('BRAND', 'INDIVIDUAL', 'COLLABORATION', 'SHOW', 'EVENT', 'OTHER');

-- CreateEnum
CREATE TYPE "CrawlState" AS ENUM ('PENDING', 'COMPLETED', 'ERROR');

-- CreateEnum
CREATE TYPE "ChannelLinkType" AS ENUM ('Twitter', 'FacebooK', 'LinkedIn', 'GitHub', 'Twitch', 'Instagram', 'Homepage', 'Blog', 'YouTube', 'Podcast', 'Patreon', 'Shop', 'Discord', 'Slack', 'Links', 'Link', 'TikTok', 'Course');

-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('UPCOMING', 'PUBLISHED', 'MODERATED', 'LIVE', 'HIDDEN', 'DELETED', 'PRIVATE', 'UNLISTED', 'OVERDUE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "VideoType" AS ENUM ('VIDEO', 'SHORT');

-- CreateEnum
CREATE TYPE "QuotaUsageEndpoints" AS ENUM ('CHANNELSLIST', 'PLAYLISTITEMSLIST', 'VIDEOSLIST');

-- CreateTable
CREATE TABLE "Channel" (
    "id" SERIAL NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "channelName" TEXT NOT NULL,
    "authorName" TEXT,
    "type" "ChannelType" NOT NULL DEFAULT 'INDIVIDUAL',
    "status" "ChannelStatus" NOT NULL DEFAULT 'ACTIVE',
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "customUrl" TEXT,
    "description" TEXT,
    "country" TEXT,
    "thumbnail" TEXT,
    "thumbnailMedium" TEXT,
    "thumbnailHigh" TEXT,
    "defaultCategory" "Category",
    "defaultLanguage" TEXT NOT NULL DEFAULT 'en',
    "viewCount" INTEGER NOT NULL DEFAULT -1,
    "subscriberCount" INTEGER NOT NULL DEFAULT -1,
    "hiddenSubscriberCount" BOOLEAN NOT NULL DEFAULT false,
    "videoCount" INTEGER NOT NULL DEFAULT -1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastCheckedAt" TIMESTAMP(3),
    "lastPublishedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "crawlState" "CrawlState" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelLink" (
    "id" SERIAL NOT NULL,
    "channelId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "type" "ChannelLinkType" NOT NULL,

    CONSTRAINT "ChannelLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" SERIAL NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "channelId" INTEGER NOT NULL,
    "type" "VideoType" NOT NULL DEFAULT 'VIDEO',
    "status" "VideoStatus" NOT NULL DEFAULT 'PUBLISHED',
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "category" "Category",
    "youtubeTags" TEXT[],
    "language" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" TEXT,
    "durationSeconds" INTEGER NOT NULL DEFAULT -1,
    "viewCount" INTEGER NOT NULL DEFAULT -1,
    "likeCount" INTEGER NOT NULL DEFAULT -1,
    "commentCount" INTEGER NOT NULL DEFAULT -1,
    "scheduledStartTime" TIMESTAMP(3),
    "actualStartTime" TIMESTAMP(3),
    "actualEndTime" TIMESTAMP(3),
    "sortTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuotaUsage" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "endpoint" "QuotaUsageEndpoints" NOT NULL,
    "parts" TEXT,
    "points" INTEGER NOT NULL,
    "task" TEXT,

    CONSTRAINT "QuotaUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Channel_youtubeId_key" ON "Channel"("youtubeId");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_customUrl_key" ON "Channel"("customUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Video_youtubeId_key" ON "Video"("youtubeId");

-- CreateIndex
CREATE INDEX "Video_status_idx" ON "Video"("status");

-- AddForeignKey
ALTER TABLE "ChannelLink" ADD CONSTRAINT "ChannelLink_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
