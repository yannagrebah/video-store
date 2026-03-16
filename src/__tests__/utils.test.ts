/* eslint-disable */
import { formatCurrency, downloadPdf } from "../lib/utils";

describe("Utils", () => {
  describe("formatCurrency", () => {
    it("should format integers as EUR currency in fr-FR locale", () => {
      const result = formatCurrency(15);
      // Using regex to avoid issues with different types of spaces (NBSP, NNBSP) across Node versions
      expect(result).toMatch(/15,00.*€/);
    });

    it("should format decimals correctly", () => {
      const result = formatCurrency(1234.56);
      expect(result).toMatch(/1.*234,56.*€/);
    });

    it("should format zero correctly", () => {
      const result = formatCurrency(0);
      expect(result).toMatch(/0,00.*€/);
    });

    it("should format negative numbers correctly", () => {
      const result = formatCurrency(-20);
      expect(result).toMatch(/-20,00.*€/);
    });
  });

  describe("downloadPdf", () => {
    let createElementSpy: jest.SpyInstance;
    let appendChildSpy: jest.SpyInstance;
    let removeChildSpy: jest.SpyInstance;
    let createObjectURLSpy: jest.Mock;
    let revokeObjectURLSpy: jest.Mock;

    beforeEach(() => {
      global.URL.createObjectURL = jest.fn().mockReturnValue("mock-blob-url");
      global.URL.revokeObjectURL = jest.fn();
      createObjectURLSpy = global.URL.createObjectURL as jest.Mock;
      revokeObjectURLSpy = global.URL.revokeObjectURL as jest.Mock;

      createElementSpy = jest.spyOn(document, "createElement");
      appendChildSpy = jest
        .spyOn(document.body, "appendChild")
        .mockImplementation(() => null as unknown as Node);
      removeChildSpy = jest
        .spyOn(document.body, "removeChild")
        .mockImplementation(() => null as unknown as Node);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should create a blob, append a link, click it, and clean up", () => {
      const mockClick = jest.fn();
      const mockLink = {
        href: "",
        download: "",
        click: mockClick,
      } as unknown as HTMLAnchorElement;

      createElementSpy.mockReturnValue(mockLink);

      downloadPdf(btoa("test"), "invoice.pdf");

      // Verify Blob URL creation
      expect(createObjectURLSpy).toHaveBeenCalledWith(expect.any(Blob));

      // Verify link setup
      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(mockLink.href).toBe("mock-blob-url");
      expect(mockLink.download).toBe("invoice.pdf");

      // Verify DOM manipulation and click
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(mockClick).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);

      // Verify cleanup
      expect(revokeObjectURLSpy).toHaveBeenCalledWith("mock-blob-url");
    });
  });
});
