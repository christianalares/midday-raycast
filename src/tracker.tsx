import { Action, ActionPanel, Color, Icon, Image, List } from "@raycast/api";
import { useTrackerProjects } from "./hooks/use-tracker";
import { withMiddayClient } from "./with-midday-client";
import { useEffect, useState } from "react";
import { formatCurrency, formatDurationFromSeconds, formatTimerDuration } from "./utils";

const Tracker = () => {
  const { trackerProjects, isLoading, error } = useTrackerProjects();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search projects" throttle={true} isShowingDetail={showDetails}>
      {error && (
        <List.EmptyView
          title={error.message}
          description="Please try again"
          icon={{ source: Icon.Warning, tintColor: Color.Red }}
        />
      )}

      {!error && trackerProjects.length === 0 && (
        <List.EmptyView title="No spendings found!" icon={{ source: Icon.Warning, tintColor: Color.Orange }} />
      )}

      {trackerProjects.map((project) => {
        return (
          <ProjectListItem
            key={project.id}
            project={project}
            showDetails={showDetails}
            setShowDetails={setShowDetails}
          />
        );
      })}
    </List>
  );
};

type ProjectListItemProps = {
  project: ReturnType<typeof useTrackerProjects>["trackerProjects"][number];
  showDetails: boolean;
  setShowDetails: (showDetails: boolean) => void;
};

const ProjectListItem = ({ project, showDetails, setShowDetails }: ProjectListItemProps) => {
  const [elapsedTimer, setElapsedTimer] = useState(project.timer?.elapsedTime);

  const assignedTo = project.users?.at(0);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (project.timer) {
      timer = setInterval(() => {
        setElapsedTimer((prev) => (prev ? prev + 1 : undefined));
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [project.timer]);

  return (
    <List.Item
      key={project.id}
      title={project.name}
      icon={Icon.Play}
      accessories={[
        ...(elapsedTimer
          ? [
              {
                tag: formatTimerDuration(elapsedTimer),
                icon: { source: Icon.CircleProgress100, tintColor: Color.Red },
              },
            ]
          : []),
        ...(assignedTo
          ? [
              {
                icon: {
                  source: assignedTo.avatarUrl,
                  mask: Image.Mask.Circle,
                },
              },
            ]
          : []),
      ]}
      detail={
        <List.Item.Detail
          metadata={
            <List.Item.Detail.Metadata>
              <List.Item.Detail.Metadata.Label
                title="Created at"
                text={new Date(project.createdAt).toLocaleDateString()}
              />

              <List.Item.Detail.Metadata.TagList title="Status">
                <List.Item.Detail.Metadata.TagList.Item
                  text={project.status === "in_progress" ? "In Progress" : "Completed"}
                  color={project.status === "in_progress" ? Color.Blue : Color.Green}
                />
              </List.Item.Detail.Metadata.TagList>

              {assignedTo && (
                <List.Item.Detail.Metadata.Label
                  title="Assigned to"
                  icon={{ mask: Image.Mask.Circle, source: assignedTo.avatarUrl }}
                  text={assignedTo.fullName}
                />
              )}

              <List.Item.Detail.Metadata.Label
                title="Total time"
                text={formatDurationFromSeconds(project.totalDuration || 0)}
              />

              <List.Item.Detail.Metadata.Label
                title="Total amount"
                text={formatCurrency(project.totalAmount, project.currency ?? "USD")}
              />

              {project.description && (
                <List.Item.Detail.Metadata.Label title="Description" text={project.description} />
              )}
            </List.Item.Detail.Metadata>
          }
        />
      }
      actions={
        <ActionPanel>
          <Action
            title={showDetails ? "Hide Details" : "Show Details"}
            onAction={() => setShowDetails(!showDetails)}
            icon={showDetails ? Icon.EyeDisabled : Icon.Eye}
          />

          <ActionPanel.Section>
            <Action
              title="Start timer"
              onAction={() => {
                console.log("start timer");
              }}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
              icon={{
                source: Icon.CircleProgress100,
                tintColor: Color.Red,
              }}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
};

export default withMiddayClient(Tracker);
