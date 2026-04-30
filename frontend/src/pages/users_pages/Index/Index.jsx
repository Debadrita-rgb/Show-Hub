import React from "react";
import BannerSection from "../../../components/usersComponents/Banner/BannerSection";
import MovieGallery from "../../../components/usersComponents/MovieGallery/MovieGallery";
import LifeEvents from "../../../components/usersComponents/LifeEvents/LifeEvents";

const HomePage = () => {
  return (
    <>
      <BannerSection />
      < MovieGallery /> 
      <LifeEvents />
    </>
  );
};

export default HomePage;
