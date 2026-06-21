import Images from "../global/images";
import Marquee from "../ui/marquee";

const Companies = () => {
    return (
        <div className="flex w-full pt-4 pb-20">
            <div className="flex flex-col items-center justify-center text-center w-full py-2">
                <h2 className="text-xl heading">
                    Partnered with Top Global Universities
                </h2>
                <div className="mt-16 w-full relative overflow-hidden">
                    <Marquee pauseOnHover className="[--duration:30s]">
                        <div className="flex gap-8 md:gap-12">
                            <Images.university1 className="w-32 h-8" />
                            <Images.university2 className="w-32 h-8" />
                            <Images.university3 className="w-32 h-8" />
                            <Images.university4 className="w-32 h-8" />
                            <Images.university5 className="w-32 h-8" />
                            <Images.university6 className="w-32 h-8" />
                            <Images.university7 className="w-32 h-8" />
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
