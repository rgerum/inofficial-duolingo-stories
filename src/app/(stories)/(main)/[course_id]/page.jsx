import React from "react";
import { notFound } from "next/navigation";

import CourseTitle from "./course_title";
import SetList from "./set_list";
import get_localisation from "@/lib/get_localisation";
import { get_course_data, get_course } from "../get_course_data";

export async function generateMetadata({ params, searchParams }, parent) {
  if (
    params.course_id.indexOf("-") === -1 ||
    params.course_id.indexOf(".") !== -1
  ) {
    return notFound();
  }
  const course = await get_course(params.course_id);
  if (!course) notFound();
  const localization = await get_localisation(course.from_language);

  const meta = await parent;

  return {
    title:
      localization("meta_course_title", {
        $language: course.learning_language_name,
      }) || `${course.learning_language_name} Duolingo Stories`,
    description:
      localization("meta_course_description", {
        $language: course.learning_language_name,
      }) ||
      `Improve your ${course.learning_language_name} learning by community-translated Duolingo stories.`,
    alternates: {
      canonical: `https://duostories.org/${params.course_id}`,
    },
    openGraph: {
      images: [
        `/api/og-course?lang=${params.course_id.split("-")[0]}&count=${
          course.count
        }&name=${course.learning_language_name}`,
      ],
      url: `https://duostories.org/${params.course_id}`,
      type: "website",
    },
    keywords: [course.learning_language_name, ...meta.keywords],
  };
}

export async function generateStaticParams() {
  const courses = await get_course_data();

  return courses.map((course) => ({
    course_id: course.short,
  }));
}

export default async function Page({ params }) {
  if (
    params.course_id.indexOf("-") === -1 ||
    params.course_id.indexOf(".") !== -1
  ) {
    return notFound();
  }

  return (
    <>
      <CourseTitle course_id={params.course_id} />
      <SetList course_id={params.course_id} />
    </>
  );
}
