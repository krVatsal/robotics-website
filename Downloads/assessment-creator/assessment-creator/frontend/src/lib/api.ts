import { Assignment, AssignmentFormData, GeneratedAssessment } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export interface CreateAssignmentResponse {
  success: boolean;
  assignmentId: string;
  jobId: string;
  status: string;
  message: string;
}

export async function createAssignment(
  formData: AssignmentFormData
): Promise<CreateAssignmentResponse> {
  const fd = new FormData();

  const data = {
    title: formData.title,
    subject: formData.subject,
    gradeLevel: formData.gradeLevel,
    dueDate: formData.dueDate,
    questionTypes: formData.questionTypes,
    totalMarks: formData.totalMarks,
    duration: formData.duration,
    additionalInstructions: formData.additionalInstructions || undefined,
    difficulty: formData.difficulty,
  };

  fd.append('data', JSON.stringify(data));
  if (formData.file) {
    fd.append('file', formData.file);
  }

  const res = await fetch(`${API_URL}/api/assignments`, {
    method: 'POST',
    body: fd,
  });

  return handleResponse<CreateAssignmentResponse>(res);
}

export async function getAssignment(id: string): Promise<Assignment> {
  const res = await fetch(`${API_URL}/api/assignments/${id}`);
  return handleResponse<Assignment>(res);
}

export async function listAssignments(): Promise<Assignment[]> {
  const res = await fetch(`${API_URL}/api/assignments`);
  return handleResponse<Assignment[]>(res);
}

export async function regenerateAssessment(
  id: string
): Promise<{ success: boolean; jobId: string; message: string }> {
  const res = await fetch(`${API_URL}/api/assignments/${id}/regenerate`, {
    method: 'POST',
  });
  return handleResponse(res);
}
