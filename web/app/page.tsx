import { Hero } from "@/components/Hero";
import { LatestStrip } from "@/components/LatestStrip";
import { CoursesIndex } from "@/components/CoursesIndex";
import { CourseBlock } from "@/components/CourseBlock";
import { Closing } from "@/components/Closing";
import { COURSES } from "@/lib/mock/courses";

export default function HomePage() {
  return (
    <>
      <Hero />
      <LatestStrip />
      <CoursesIndex />
      {COURSES.map((course, i) => (
        <CourseBlock key={course.slug} course={course} index={i} />
      ))}
      <Closing />
    </>
  );
}
