import { Region } from "./Map/regions";
import Logo from "./logo";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface CaptionsProps {
  data: { id: string; title: string; apo: string; dis: string; }[];
  region: Region | null;
}

const Captions: React.FC<CaptionsProps> = ({ data, region }) => {

  // When region is null, show the message to hover over a region
  if (!region) {
    return <p className="flex">Hover over a region to see the corresponding information</p>;
  }

  const hoveredRegionData = data.find((item) => item.id === region.id);

  // When there's no data for the hovered region, show 'No information available'
  if (!hoveredRegionData || hoveredRegionData.apo.trim() === "") {
    return <p className="flex">No information available</p>;
  }

  // When there's data and apo is not empty, show the title and apo
  return (
    <div className="flex items-start gap-4">
      <Avatar className="hidden h-14 w-14 sm:flex rounded-full bg-muted p-3">
        <AvatarImage src="/logo.svg" alt="Avatar" />
        <AvatarFallback>FS</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <p className="text-lg font-medium leading-none text-left">
          {hoveredRegionData.title}
        </p>
        <p className="text-left">{hoveredRegionData.apo}</p>
        <p className="text-sm text-muted-foreground text-left">
          {hoveredRegionData.dis}
        </p>
      </div>
    </div>
  )
};

export default Captions;
