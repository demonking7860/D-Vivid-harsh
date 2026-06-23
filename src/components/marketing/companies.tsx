import Marquee from "../ui/marquee";

const universities = [
    { name: "University of Nebraska", logo: "/universities/nebraska.png" },
    { name: "Concordia University", logo: "/universities/concordia.png" },
    { name: "Pace University", logo: "/universities/pace.png" },
    { name: "University of Illinois Chicago", logo: "/universities/uic.png" },
    { name: "Arizona State University", logo: "/universities/asu.png" },
    { name: "UMass Boston", logo: "/universities/umass-boston.png" },
];

const Companies = () => {
    return (
        <div className="flex w-full pt-4 pb-20">
            <div className="flex flex-col items-center justify-center text-center w-full py-2">
                <h2 className="text-xl heading">
                    Partnered with Top Global Universities
                </h2>
                <div className="mt-16 w-full relative overflow-hidden">
                    <Marquee pauseOnHover className="[--duration:30s]">
                        <div className="flex gap-6 md:gap-8">
                            {universities.map((university) => (
                                <div
                                    key={university.name}
                                    className="flex items-center justify-center h-20 w-44 shrink-0 rounded-xl bg-white px-6 py-4 shadow-sm"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={university.logo}
                                        alt={`${university.name} logo`}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                </div>
                            ))}
                        </div>
                    </Marquee>
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
                </div>
            </div>
        </div>
    )
};

export default Companies
