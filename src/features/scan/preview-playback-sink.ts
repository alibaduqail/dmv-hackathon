import type { PreviewPlaybackSink } from '../../types.ts';

type PreviewVideoElement = Pick<HTMLVideoElement, 'pause' | 'play' | 'srcObject'>;

export const createPreviewPlaybackSink = (
  getVideo: () => PreviewVideoElement | null,
): PreviewPlaybackSink => {
  let attachedVideo: PreviewVideoElement | null = null;

  return {
    async play(stream) {
      const video = getVideo();
      if (!video) throw { name: 'NotSupportedError' };

      attachedVideo = video;
      if (video.srcObject !== stream) video.srcObject = stream;
      await video.play();
    },

    clear(stream) {
      const video = attachedVideo ?? getVideo();
      if (!video || (stream !== null && video.srcObject !== stream)) return;

      video.pause();
      video.srcObject = null;
      if (attachedVideo === video) attachedVideo = null;
    },
  };
};
