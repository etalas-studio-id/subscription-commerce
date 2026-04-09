import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UsersPage from "./page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/admin/users",
}));

// Mock sonner
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockUsers = [
  {
    id: "1",
    name: "Alice Registered",
    email: "alice@example.com",
    phone: "+628111111",
    createdAt: "2025-01-01T00:00:00.000Z",
    isRegistered: true,
    _count: { orders: 3 },
  },
  {
    id: "2",
    name: "Bob Guest",
    email: "bob@example.com",
    phone: null,
    createdAt: "2025-02-01T00:00:00.000Z",
    isRegistered: false,
    _count: { orders: 1 },
  },
];

describe("UsersPage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => mockUsers })
    );
  });

  it("renders users list with registered and guest badges", async () => {
    render(<UsersPage />);
    await waitFor(() => expect(screen.getByText("Alice Registered")).toBeInTheDocument());
    expect(screen.getAllByText("Registered").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Guest").length).toBeGreaterThan(0);
  });

  it("filters to show only registered users", async () => {
    render(<UsersPage />);
    await waitFor(() => screen.getByText("Alice Registered"));
    const select = screen.getByRole("combobox");
    await userEvent.selectOptions(select, "REGISTERED");
    expect(screen.getByText("Alice Registered")).toBeInTheDocument();
    expect(screen.queryByText("Bob Guest")).not.toBeInTheDocument();
  });

  it("filters to show only guest users", async () => {
    render(<UsersPage />);
    await waitFor(() => screen.getByText("Bob Guest"));
    const select = screen.getByRole("combobox");
    await userEvent.selectOptions(select, "GUEST");
    expect(screen.queryByText("Alice Registered")).not.toBeInTheDocument();
    expect(screen.getByText("Bob Guest")).toBeInTheDocument();
  });

  it("searches by name", async () => {
    render(<UsersPage />);
    await waitFor(() => screen.getByText("Alice Registered"));
    await userEvent.type(screen.getByPlaceholderText(/search/i), "alice");
    expect(screen.getByText("Alice Registered")).toBeInTheDocument();
    expect(screen.queryByText("Bob Guest")).not.toBeInTheDocument();
  });

  it("opens edit modal and saves changes", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => mockUsers })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockUsers[0], name: "Alice Updated" }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(<UsersPage />);
    await waitFor(() => screen.getByText("Alice Registered"));
    const editButtons = screen.getAllByRole("button", { name: "" });
    await userEvent.click(editButtons[0]);
    expect(screen.getByText("Edit User")).toBeInTheDocument();

    const nameInput = screen.getByDisplayValue("Alice Registered");
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Alice Updated");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/users",
        expect.objectContaining({ method: "PATCH" })
      )
    );
  });
});
