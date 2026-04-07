import useDebounce from "@/hooks/use-debounce";
import { useCallback, useEffect } from "react";
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";
import { useGetTrainingDatasetsV2 } from "./use-datasets";
import { ORDERING_FIELDS } from "@/components/shared/filters/ordering-filter";
import { SEARCH_PARAMS } from "@/utils/search-params";
import { LayoutView } from "@/enums";
import { PAGE_LIMIT } from "@/components/shared";

const useDatasetsSearchParams = () => {
  return useQueryStates({
    [SEARCH_PARAMS.searchQuery]: parseAsString.withDefault(""),
    [SEARCH_PARAMS.ordering]: parseAsString.withDefault(
      ORDERING_FIELDS[1].apiValue as string,
    ),
    [SEARCH_PARAMS.offset]: parseAsInteger.withDefault(0),
    [SEARCH_PARAMS.layout]: parseAsString.withDefault(LayoutView.GRID),
    [SEARCH_PARAMS.mapIsActive]: parseAsBoolean.withDefault(false),
    [SEARCH_PARAMS.id]: parseAsString.withDefault(""),
  });
};

export const useDatasetsQueryParams = (userId?: number) => {
  const [params, setParams] = useDatasetsSearchParams();

  const search = params[SEARCH_PARAMS.searchQuery] as string;
  const ordering = params[SEARCH_PARAMS.ordering] as string;
  const offset = params[SEARCH_PARAMS.offset] as number;
  const layout = params[SEARCH_PARAMS.layout] as string;
  const mapIsActive = params[SEARCH_PARAMS.mapIsActive] as boolean;
  const datasetIdParam = params[SEARCH_PARAMS.id] as string;

  const debouncedSearch = useDebounce(search, 300);

  const { isPending, isError, data, refetch, isPlaceholderData } =
    useGetTrainingDatasetsV2(
      debouncedSearch.length > 0 ? debouncedSearch : undefined,
      ordering,
      userId !== undefined ? userId : undefined,
      offset > 0 ? offset : undefined,
      datasetIdParam.length > 0 ? parseInt(datasetIdParam) : undefined,
    );

  // Reset offset to 0 when searching or when ID filtering is applied from the map.
  useEffect(() => {
    if ((search !== "" || datasetIdParam !== "") && offset > 0) {
      void setParams({ [SEARCH_PARAMS.offset]: 0 });
    }
  }, [search, datasetIdParam, offset, setParams]);

  // Disable map view when list layout is selected.
  useEffect(() => {
    if (layout === LayoutView.LIST && mapIsActive) {
      void setParams({ [SEARCH_PARAMS.mapIsActive]: false });
    }
  }, [layout, mapIsActive, setParams]);

  const setSearch = useCallback(
    (value: string) => {
      void setParams({
        [SEARCH_PARAMS.searchQuery]: value || null,
        [SEARCH_PARAMS.offset]: 0,
      });
    },
    [setParams],
  );

  const setOrdering = useCallback(
    (value: string) => {
      void setParams({
        [SEARCH_PARAMS.ordering]: value,
        [SEARCH_PARAMS.offset]: 0,
      });
    },
    [setParams],
  );

  const setLayout = useCallback(
    (value: string) => {
      void setParams({ [SEARCH_PARAMS.layout]: value });
    },
    [setParams],
  );

  const setMapView = useCallback(
    (value: boolean) => {
      void setParams({ [SEARCH_PARAMS.mapIsActive]: value });
    },
    [setParams],
  );

  const setDatasetId = useCallback(
    (value: string | number | null) => {
      void setParams({
        [SEARCH_PARAMS.id]: value ? String(value) : null,
        [SEARCH_PARAMS.offset]: 0,
      });
    },
    [setParams],
  );

  const clearAllFilters = useCallback(() => {
    void setParams({
      [SEARCH_PARAMS.searchQuery]: null,
      [SEARCH_PARAMS.id]: null,
      [SEARCH_PARAMS.offset]: 0,
    });
  }, [setParams]);

  const goToNextPage = useCallback(() => {
    if (data?.hasNext) {
      void setParams({ [SEARCH_PARAMS.offset]: offset + PAGE_LIMIT });
    }
  }, [data?.hasNext, offset, setParams]);

  const goToPrevPage = useCallback(() => {
    if (data?.hasPrev) {
      void setParams({
        [SEARCH_PARAMS.offset]: Math.max(offset - PAGE_LIMIT, 0),
      });
    }
  }, [data?.hasPrev, offset, setParams]);

  const mapViewIsActive = mapIsActive && layout !== LayoutView.LIST;

  return {
    data,
    isPending,
    isPlaceholderData,
    isError,
    refetch,
    search,
    ordering,
    layout,
    offset,
    mapViewIsActive,
    datasetIdParam,
    setSearch,
    setOrdering,
    setLayout,
    setMapView,
    setDatasetId,
    clearAllFilters,
    goToNextPage,
    goToPrevPage,
  };
};
