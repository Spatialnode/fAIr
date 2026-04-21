import { TDatasetContent } from "@/types";

export const DATASET_CONTENT: TDatasetContent = {
  createDataset: {
    metadataStep: {
      buttons: {
        back: "Back",
        addKeyValue: "+ Add key value",
      },
      headings: {
        create: "Create Training Dataset",
        edit: "Edit Training Dataset",
      },
      descriptions: {
        create:
          "A training dataset consists of high-resolution aerial imagery used as the base layer for fine-tuning your AI model. You can either create a new dataset or select existing imagery that covers your area of interest.",
        edit: "Update the dataset details and continue to the training area step to manage AOIs and labels.",
      },
      sectionTitles: {
        create: "Create New Training Dataset",
        edit: "Update Dataset Details",
      },
      form: {
        datasetName: {
          label: "Dataset Name",
          helpText:
            "Dataset name should be at least 10 characters and at most 40 characters.",
          placeholder: "E.g Kakuma OpenAerial Imagery",
          toolTip:
            "Dataset name should be at least 10 characters and at most 40 characters.",
        },
        datasetDescription: {
          label: "Dataset Description",
          placeholder:
            "E.g This dataset includes high-resolution imagery from Northern Kaduna and is used for rooftop extraction.",
          toolTip:
            "Describe the imagery source, coverage, and what labels this dataset will provide.",
        },
        taskType: {
          label: "Task Type",
          placeholder: "Select task type",
          toolTip:
            "Choose the model task this dataset supports, such as classification, segmentation, or detection.",
        },
        geometryType: {
          label: "Geometry Type",
          placeholder: "Select geometry type",
          toolTip:
            "Choose the annotation geometry used in this dataset, such as polygons or rectangles.",
        },
        featureType: {
          label: "Feature Type",
          placeholder: "Select feature type",
          toolTip:
            "Select the primary feature category this dataset focuses on.",
        },
        keyValues: {
          label: "Key Value",
          placeholder: "Enter key value",
          toolTip:
            "Define label key values used to fetch or organize mapped features in this dataset.",
        },
        tags: {
          label: "Tags",
          placeholder: "Enter Tags",
          toolTip:
            "Add searchable keywords to make this dataset easier to discover and filter.",
          helpText: "Separate tags with comma",
        },
      },
      mapPreview: {
        invalidTileService: "Enter a valid tile service url to see a preview.",
      },
    },
    mapswipeProject: {
      title: "MapSwipe Locate Project(s)",
      description:
        'fAIr will use the following details to create one or more MapSwipe Locate Project(s). The number of MapSwipe Projects depends on the needed features, e.g. we are building a dataset to identify different "rooftops" like "zinc" and "wood", fAIr will create 2 MapSwipe Locate Projects for same AOIs so swiper can support us identify those features and get the dataset ready for fAIr to use to create/fine-tune a GeoAI model.',
      buttons: {
        cancel: "Cancel",
        create: "Create",
      },
      staticValues: {
        requestingOrganisation: "HOT",
        visibility: "Public",
      },
      form: {
        projectTopic: {
          label: "Project Topic",
          toolTip:
            "Give this MapSwipe project a short, recognizable title for contributors.",
        },
        projectRegion: {
          label: "Project Region",
          toolTip:
            "Specify the area or region where contributors will be reviewing imagery.",
        },
        projectDescription: {
          label: "Project Description",
          toolTip:
            "Explain what the project covers and what outcome the review should support.",
        },
        instruction: {
          label: "Instruction",
          toolTip:
            "Provide the guidance contributors should follow while swiping tasks.",
        },
        lookFor: {
          label: "Look for (legacy)",
          toolTip:
            "Describe the main feature contributors should identify in the imagery.",
        },
        requestingOrganisation: {
          label: "Requesting Organisation",
          toolTip:
            "The organization requesting and managing the MapSwipe project.",
        },
        visibility: {
          label: "Visibility",
          toolTip:
            "Visibility determines who can access and contribute to the project.",
        },
        tutorial: {
          label: "Tutorial",
          toolTip:
            "Select the tutorial contributors should review before mapping.",
        },
        additionalInformationResource: {
          label: "Additional information resource (URL)",
          toolTip:
            "Reference link contributors can use for more project context.",
        },
        inputGeometriesFile: {
          label: "Input Geometries File (Direct Link)",
          toolTip:
            "The source geometry file link MapSwipe will use to generate tasks.",
        },
        customImageryServerUrl: {
          label: "Custom Imagery Server URL",
          toolTip:
            "The imagery source that contributors will inspect in MapSwipe.",
        },
        imageryCredits: {
          label: "Imagery Credits",
          toolTip: "Credits shown to acknowledge the imagery provider.",
        },
        minZoom: {
          label: "Min Zoom",
          toolTip:
            "Minimum zoom level contributors should reach before reviewing tasks.",
        },
        projectCoverImage: {
          label: "Project Cover Image",
          toolTip:
            "Upload a cover image that helps contributors recognize the project.",
        },
        verificationNumber: {
          label: "Verification Number",
          toolTip:
            "How many independent validations are required for each task.",
        },
        groupSize: {
          label: "Group Size",
          toolTip: "Set how many tasks are grouped together in a batch.",
        },
        maxTasksPerUser: {
          label: "Max tasks per user",
          toolTip: "Limit how many tasks a single contributor can complete.",
        },
        zoomLevel: {
          label: "Zoom Level",
          toolTip: "Choose the imagery zoom preset used for the project.",
        },
        subGrid: {
          label: "Subgrid",
          description: "Sub grid size",
          toolTip: "Pick the subgrid size used to split each task tile.",
        },
        exportMeta: {
          label: "Export Meta",
          toolTip:
            "Metadata values that will be exported alongside project results.",
        },
        exportMetaKey: {
          label: "Key",
          toolTip: "The metadata key attached to the exported labels.",
        },
        exportMetaValue: {
          label: "Value",
          toolTip: "The metadata values attached to the exported labels.",
        },
      },
    },
  },
  detailPage: {
    labels: {
      datasetId: "Dataset ID:",
      description: "Description",
      taskType: "Task Type",
      geometryType: "Geometry Type",
      featureType: "Feature Type",
      keyValues: "Key Values",
      notAvailable: "N/A",
      usedBy: "Used by",
      modelsSingular: "Model",
      modelsPlural: "Models",
      createdBy: "Created by",
      lastModified: "Last Modified",
      version: "Version:",
      inProgress: "In progress",
      sourceImagery: "Source Imagery:",
      labelSource: "Label Source:",
      datasetFiles: "Dataset files",
    },
    buttons: {
      useDataset: "Use Dataset",
      settings: "Settings",
    },
    settingsMenu: {
      editDetails: "Edit Details",
      editTrainingArea: "Edit Training Area",
      cloneDataset: "Clone Dataset",
      publish: "Publish",
    },
    sections: {
      modelsUsingDataset: "Models Using this Dataset",
    },
    errors: {
      loadingPrefix: "Error loading dataset",
      retry: "Retry",
    },
  },
};
