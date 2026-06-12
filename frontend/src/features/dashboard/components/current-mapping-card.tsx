import { useEffect } from "react";
import { MapComponent } from "@/components/map";
import { useMapInstance } from "@/hooks/use-map-instance";
import { APPLICATION_ROUTES } from "@/constants";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider";
import ContourBackground from "@/assets/svgs/contour_background.svg";
import { MapPlayIcon } from "@/components/ui/icons/map-play-icon";
import { ButtonWithIcon } from "@/components/ui/button";
import { ButtonVariant } from "@/enums";

export const CurrentMappingCard = () => {
  const { mapContainerRef, map } = useMapInstance(false, false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const tileServiceURL =
    "https://tiles.openaerialmap.org/62d85d11d8499800053796c1/0/62d85d11d8499800053796c2/{z}/{x}/{y}";

  useEffect(() => {
    if (map) {
      map.jumpTo({
        center: [85.5228, 27.6337],
        zoom: 16,
      });
    }
  }, [map]);

  return (
    <article
      className="rounded-[24px]  p-2 text-white grid grid-cols-1 md:grid-cols-[1.1fr_1.4fr] gap-6 w-full items-stretch min-h-[480px] shadow-lg relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(165deg, #1e222b 0%, #2b303c 100%), url(${ContourBackground})`,
        backgroundSize: "cover",
        backgroundBlendMode: "overlay",
      }}
    >
      {/* Left Column: Details */}
      <div className="flex flex-col p-3 justify-between h-full space-y-8 z-10">
        <div className="space-y-4">
          <span className="text-xs  tracking-wider text-white">
            Recent Project
          </span>
          <h2 className="text-[20px] font-semibold tracking-tight text-white leading-tight">
            Untitled Project
          </h2>
          <div className="inline-block bg-grey text-white rounded-[4px] px-3.5 py-1 text-xs d w-fit ">
            Buildings
          </div>
          <p className="text-xs text-lighter-ink font-medium pt-3">
            Edited 24mins ago
          </p>

          {/* Overlapping Avatars */}
          <div className="flex -space-x-2 mt-4 items-center">
            <img
              src={
                user?.img_url ||
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80"
              }
              alt="Team member 1"
              className="size-8 rounded-full border-2 border-[#1e222b] object-cover shadow-sm"
            />
            <img
              src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&h=80&q=80"
              alt="Team member 2"
              className="size-8 rounded-full border-2 border-[#1e222b] object-cover shadow-sm"
            />
          </div>
        </div>

        {/* Action Button */}

        <div className="w-fit max-w-[299px]">
          <ButtonWithIcon
            onClick={() => navigate(APPLICATION_ROUTES.TRY_FAIR)}
            prefixIcon={MapPlayIcon}
            label="Resume Mapping"
            textStyle={{ fontSize: "12px", fontWeight: 400 }}
            variant={ButtonVariant.PRIMARY}
            rounded
            size="medium"
          />
        </div>
      </div>

      {/* Right Column: Interactive Map Preview */}
      <div className="relative w-full  h-[320px] md:h-full rounded-[18px] overflow-hidden shadow-inner z-10 min-h-[220px]">
        <MapComponent
          map={map}
          mapContainerRef={mapContainerRef}
          tileServiceURL={tileServiceURL}
          zoomControls={false}
        />
      </div>
    </article>
  );
};
