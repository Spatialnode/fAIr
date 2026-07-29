import { useQuery } from "@tanstack/react-query";
import {
  getBaseModelById,
  getBaseModels,
} from "@/features/base-models/api/get-base-models";
import {
  mapStacItemToBaseModel,
  mapStacItemToBaseModelDetail,
} from "@/features/base-models/utils/stac";

export const useBaseModels = () => {
  return useQuery({
    queryKey: ["base-models"],
    queryFn: async () => {
      const data = await getBaseModels();
      return data.features.map(mapStacItemToBaseModel);
    },
  });
};

export const useBaseModel = (id?: string) => {
  return useQuery({
    queryKey: ["base-model", id],
    queryFn: async () => {
      const data = await getBaseModelById(id as string);
      const model = mapStacItemToBaseModelDetail(data);

      // markdownContent is a URL — fetch the actual text content
      if (model.markdownContent) {
        try {
          const res = await fetch(model.markdownContent);
          if (res.ok) {
            model.markdownContent = await res.text();
          } else {
            model.markdownContent = "";
          }
        } catch {
          model.markdownContent = "";
        }
      }

      return model;
    },
    enabled: !!id,
  });
};
