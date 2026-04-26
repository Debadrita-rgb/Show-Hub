const YouTubePlayer = ({ videoId }) => {
  const isValid = /^[a-zA-Z0-9_-]{11}$/.test(videoId);

  if (!isValid) {
    return <div>Invalid Video</div>;
  }

  return (
    <iframe
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
      title="YouTube video"
      className="w-full h-[220px] sm:h-[300px] md:h-[360px] lg:h-[420px] rounded-lg"
      allow="autoplay; encrypted-media"
      allowFullScreen
    />
  );
};
export default YouTubePlayer;