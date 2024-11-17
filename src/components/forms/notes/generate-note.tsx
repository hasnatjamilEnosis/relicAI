"use client";

import FieldContainer from "@/components/custom-ui/form-field-container";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { useRouter } from "next/navigation";
import { z } from "zod";

export default function GenerateNote({
  preferredProjectId,
  allUsersList,
  preferredUsers,
  projectList,
  boardList,
  sprintList,
}: {
  preferredProjectId: string;
  allUsersList: { value: string; label: string }[];
  preferredUsers: string;
  projectList: { value: string; label: string }[];
  boardList: {
    projectKey: string;
    boards: any;
  }[];
  sprintList: {
    projectKey: string;
    boardId: string;
    boardName: string;
    sprints: { value: string; label: string }[];
  }[];
}) {
  // router
  const router = useRouter();
  // form handler
  const { Field, Subscribe, handleSubmit } = useForm({
    defaultValues: {
      projectId: preferredProjectId,
      startDate: "",
      endDate: "",
      boardId: "",
      sprintId: "",
      users: preferredUsers,
    },
    onSubmit: async (values) => {
      const { boardId, projectId, sprintId, startDate, endDate, users } =
        values.value;
      const extractedBoardId = boardId.split("-")[1];
      const extractedSplitId = sprintId.split("-")[1];

      const queryObject = {
        boardId: extractedBoardId,
        projectId,
        sprintId: extractedSplitId,
        startDate,
        endDate,
        users,
      };
      router.push("/preview?" + new URLSearchParams(queryObject).toString());
    },
    validatorAdapter: zodValidator(),
  });

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit();
        }}
      >
        <FieldContainer>
          <Field
            name="startDate"
            validators={{
              onChange: z.string(),
            }}
            children={({ state, handleChange }) => (
              <>
                <Label htmlFor="startDate" className="mb-3 block text-sm">
                  Start Date
                </Label>
                <DatePicker
                  id="startDate"
                  onChange={handleChange}
                  placeholder="select start date"
                />
                <span
                  className={`${
                    state.meta.errors.length > 0 ? "visible" : "invisible"
                  } text-xs text-pink-600 block`}
                >
                  {state.meta.errors.length > 0
                    ? state.meta.errors.join(", ")
                    : "field error"}
                </span>
              </>
            )}
          />
        </FieldContainer>
        <FieldContainer>
          <Field
            name="endDate"
            validators={{
              onChange: z.string(),
            }}
            children={({ state, handleChange }) => (
              <>
                <Label htmlFor="endDate" className="mb-3 block text-sm">
                  End Date
                </Label>
                <DatePicker
                  id="endDate"
                  onChange={handleChange}
                  placeholder="select end date"
                />
                <span
                  className={`${
                    state.meta.errors.length > 0 ? "visible" : "invisible"
                  } text-xs text-pink-600 block`}
                >
                  {state.meta.errors.length > 0
                    ? state.meta.errors.join(", ")
                    : "field error"}
                </span>
              </>
            )}
          />
        </FieldContainer>
        <FieldContainer>
          <Field
            name="projectId"
            validators={{
              onChange: z.string().optional(),
            }}
            children={({ state, handleChange }) => (
              <>
                <Label htmlFor="project" className="mb-3 block text-sm">
                  Project
                </Label>
                {projectList.length === 0 ? (
                  <>
                    <span className="text-sm text-gray-500 block">
                      No projects found. Please ensure JIRA API Key is present.
                    </span>
                  </>
                ) : (
                  <>
                    <Select value={state.value} onValueChange={handleChange}>
                      <SelectTrigger id="project" className="w-96">
                        <SelectValue placeholder="Select Preferred Project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Projects</SelectLabel>
                          {projectList.map((project) => (
                            <SelectItem
                              key={project.value}
                              value={project.value}
                            >
                              {project.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <span
                      className={`${
                        state.meta.errors.length > 0 ? "visible" : "invisible"
                      } text-xs text-pink-600 block`}
                    >
                      {state.meta.errors.length > 0
                        ? state.meta.errors.join(", ")
                        : "field error"}
                    </span>
                  </>
                )}
              </>
            )}
          />
        </FieldContainer>
        <FieldContainer>
          <Field
            name="users"
            validators={{
              onChange: z.string().optional(),
            }}
            children={({ state, handleChange }) => (
              <>
                <Label htmlFor="users" className="mb-3 block text-sm">
                  Users
                </Label>
                {allUsersList.length === 0 ? (
                  <>
                    <span className="text-sm text-gray-500 block">
                      No users found. Please ensure JIRA API Key is present.
                    </span>
                  </>
                ) : (
                  <>
                    <MultiSelect
                      className="w-96"
                      id="preferredUsers"
                      options={allUsersList}
                      onValueChange={(values) =>
                        handleChange(values.join(", "))
                      }
                      defaultValue={
                        state.value === ""
                          ? []
                          : state.value.split(",").map((v) => v.trim())
                      }
                      placeholder="Select Preferred Users"
                      variant="inverted"
                      animation={3}
                      maxCount={6}
                    />
                    <span
                      className={`${
                        state.meta.errors.length > 0 ? "visible" : "invisible"
                      } text-xs text-pink-600 block`}
                    >
                      {state.meta.errors.length > 0
                        ? state.meta.errors.join(", ")
                        : "field error"}
                    </span>
                  </>
                )}
              </>
            )}
          />
        </FieldContainer>
        <FieldContainer>
          <Field
            name="boardId"
            validators={{
              onChange: z.string().optional(),
            }}
            children={({ state, handleChange }) => (
              <>
                <Label htmlFor="board" className="mb-3 block text-sm">
                  Board
                </Label>
                {boardList?.length === 0 || !boardList ? (
                  <>
                    <span className="text-sm text-gray-500 block">
                      No boards found. Please ensure JIRA API Key is present.
                    </span>
                  </>
                ) : (
                  <>
                    <Select value={state.value} onValueChange={handleChange}>
                      <SelectTrigger id="board" className="w-96">
                        <SelectValue placeholder="Select Preferred Board" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Boards</SelectLabel>
                          {boardList.map((projectBoard) =>
                            projectBoard.boards.map(
                              (board: {
                                value: string;
                                label: string;
                                type: string;
                              }) => (
                                <SelectItem
                                  key={projectBoard.projectKey + board.value}
                                  value={`${projectBoard.projectKey}-${board.value}`}
                                >
                                  {projectBoard.projectKey} - {board.label}
                                </SelectItem>
                              )
                            )
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <span
                      className={`${
                        state.meta.errors.length > 0 ? "visible" : "invisible"
                      } text-xs text-pink-600 block`}
                    >
                      {state.meta.errors.length > 0
                        ? state.meta.errors.join(", ")
                        : "field error"}
                    </span>
                  </>
                )}
              </>
            )}
          />
        </FieldContainer>
        <FieldContainer>
          <Field
            name="sprintId"
            validators={{
              onChange: z.string().optional(),
            }}
            children={({ state, handleChange }) => (
              <>
                <Label htmlFor="sprint" className="mb-3 block text-sm">
                  Sprint
                </Label>
                {boardList?.length === 0 || !boardList ? (
                  <>
                    <span className="text-sm text-gray-500 block">
                      No sprints found. Please ensure JIRA API Key is present.
                    </span>
                  </>
                ) : (
                  <>
                    <Select value={state.value} onValueChange={handleChange}>
                      <SelectTrigger id="sprint" className="w-96">
                        <SelectValue placeholder="Select Preferred Sprint" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Sprints</SelectLabel>
                          {sprintList.map((projectSprint) =>
                            projectSprint.sprints.map((sprint) => (
                              <SelectItem
                                key={projectSprint.projectKey + sprint.value}
                                value={`${projectSprint.projectKey}-${sprint.label}`}
                              >
                                {projectSprint.projectKey} - {sprint.label}
                              </SelectItem>
                            ))
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <span
                      className={`${
                        state.meta.errors.length > 0 ? "visible" : "invisible"
                      } text-xs text-pink-600 block`}
                    >
                      {state.meta.errors.length > 0
                        ? state.meta.errors.join(", ")
                        : "field error"}
                    </span>
                  </>
                )}
              </>
            )}
          />
        </FieldContainer>
        <Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? "Generating..." : "Generate"}
            </Button>
          )}
        />
      </form>
    </>
  );
}
