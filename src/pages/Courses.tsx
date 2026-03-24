import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Users, ArrowRight, BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Layout from "@/components/Layout";
import { fadeUp } from "@/lib/animations";
import { useCourses } from "@/hooks/use-courses";

const Courses = () => {
  const { data: courses, isLoading } = useCourses();

  return (
    <Layout>
      {/* Header */}
      <section className="py-16 lg:py-24 bg-gradient-green relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, hsl(30, 100%, 46%) 0%, transparent 50%)" }} />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-medium tracking-widest uppercase text-sm mb-2">HTB Consult Academy</motion.p>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Practical Training for Professional Growth
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground max-w-2xl">
              Practical skills training in business analysis, project delivery, digital transformation, and professional development — built from real consulting experience.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="py-16 lg:py-24 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-card border-border h-full flex flex-col">
                  <CardContent className="p-6 flex-1 space-y-3">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ))
            ) : (
              (courses || []).map((course, i) => (
                <motion.div key={course.id} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                  <Card className="bg-card border-border hover:border-primary/40 transition-all duration-300 hover:shadow-gold h-full flex flex-col">
                    <CardContent className="p-6 flex-1">
                      <Badge variant="secondary" className="mb-3 bg-primary/10 text-primary border-0">
                        {course.category}
                      </Badge>
                      <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{course.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{course.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock size={14} /> {course.total_duration}</span>
                        <span className="flex items-center gap-1"><Star size={14} className="text-primary fill-primary" /> {course.rating}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {(course.tags || []).slice(0, 3).map((t) => (
                          <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 pt-0 flex items-center justify-between">
                      <span className="text-2xl font-bold text-gradient-gold">{course.price > 0 ? `£${course.price}` : "Free"}</span>
                      <Button asChild className="bg-gradient-gold hover:opacity-90">
                        <Link to={`/course/${course.id}`}>
                          View Course <ArrowRight className="ml-1" size={16} />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Courses;
