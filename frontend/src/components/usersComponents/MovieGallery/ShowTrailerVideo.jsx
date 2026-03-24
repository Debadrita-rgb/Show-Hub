import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../../../config";


const ShowTrailerVideo = () => {
  const { slug, id } = useParams();
    const navigate = useNavigate();

  const [movie, setMovie] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/user/get-single-movie/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setMovie(data);
      });
  }, [id]);

  useEffect(() => {
      if (movie) {
        const correctSlug = movie.title
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");
  
        if (slug !== correctSlug) {
          navigate(`/movie/${correctSlug}/${id}`, { replace: true });
        }
      }
    }, [movie, slug, id]);
  
  if (!movie) return <p className="text-white p-10">Loading...</p>;

  return (
    <div className="min-h-screen text-white px-4 sm:px-10 py-10">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
        Videos for {movie?.title}
      </h1>

      <div className="flex justify-center">
        <div className="w-full max-w-4xl aspect-video">
          <iframe
            src={movie?.trailerlink}
            title="Movie Trailer"
            allowFullScreen
            className="w-full h-full rounded-xl"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default ShowTrailerVideo;
