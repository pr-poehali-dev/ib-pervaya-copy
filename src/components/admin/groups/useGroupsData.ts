import { useState } from "react";
import { User, CourseAssignment, CourseStatus } from "@/components/admin/types";
import { today } from "./groupsUtils";

export function useGroupsData(initialUsers: User[]) {
  const [localUsers, setLocalUsers] = useState<User[]>(initialUsers);

  const addCoursesToMember = (userId: number, courseIds: number[]) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      const newAssignments: CourseAssignment[] = courseIds
        .filter((id) => !u.assignments.some((a) => a.courseId === id))
        .map((id) => ({ courseId: id, active: true, progress: 0, assignedAt: today(), status: "pending" as CourseStatus }));
      return { ...u, assignments: [...u.assignments, ...newAssignments] };
    }));
  };

  const addCoursesToGroup = (group: string, courseIds: number[]) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.group !== group) return u;
      const newAssignments: CourseAssignment[] = courseIds
        .filter((id) => !u.assignments.some((a) => a.courseId === id))
        .map((id) => ({ courseId: id, active: true, progress: 0, assignedAt: today(), status: "pending" as CourseStatus }));
      return { ...u, assignments: [...u.assignments, ...newAssignments] };
    }));
  };

  const activateCourse = (userId: number, courseId: number, date?: string) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      return { ...u, assignments: u.assignments.map((a) =>
        a.courseId !== courseId ? a : { ...a, activatedAt: date ?? today(), active: true, status: "active" as CourseStatus, progress: 0 }
      )};
    }));
  };

  const extendCourse = (userId: number, courseId: number) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      return { ...u, assignments: u.assignments.map((a) =>
        a.courseId !== courseId ? a : { ...a, status: "active" as CourseStatus }
      )};
    }));
  };

  const issueCertificate = (userId: number, courseId: number) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      return { ...u, assignments: u.assignments.map((a) =>
        a.courseId !== courseId ? a : { ...a, status: "certified" as CourseStatus, progress: 100, completedAt: a.completedAt ?? today() }
      )};
    }));
  };

  const toggleAssignment = (userId: number, courseId: number) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      return { ...u, assignments: u.assignments.map((a) =>
        a.courseId !== courseId ? a : { ...a, active: !a.active }
      )};
    }));
  };

  const handleActivateAll = (_group: string, members: User[]) => {
    const date = today();
    members.forEach((u) => {
      u.assignments.filter((a) => !a.activatedAt).forEach((a) => {
        activateCourse(u.id, a.courseId, date);
      });
    });
  };

  return {
    localUsers,
    addCoursesToMember,
    addCoursesToGroup,
    activateCourse,
    extendCourse,
    issueCertificate,
    toggleAssignment,
    handleActivateAll,
  };
}