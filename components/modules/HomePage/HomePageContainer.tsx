"use client";

import React from "react";
import { MotionConfig } from "framer-motion";
import BuildWithUs from "./BuildWithUs/BuildWithUs";
import ResultAnalytics from "./ResultAnalytics/ResultAnalytics";
import Testimonial from "./Testimonial/Testimonial";
import WorkingProgress from "./WorkingProgress/WorkingProgress";
import NewProducts from "./NewProducts/NewProducts";
import PopularCategories from "./PopularCategories/PopularCategories";
import Banner from "./Banner/Banner";

export default function HomePageContainer() {
  return (
    // Honour the OS "reduce motion" setting across every home section
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-clip bg-[#F5F7FB] dark:bg-[#05071A]">
        <Banner />
        <PopularCategories />
        <NewProducts />
        <WorkingProgress />
        <ResultAnalytics />
        <BuildWithUs />
        <Testimonial />
      </div>
    </MotionConfig>
  );
}
