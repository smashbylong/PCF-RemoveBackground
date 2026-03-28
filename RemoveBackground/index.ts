import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class RemoveBackground implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _container: HTMLDivElement;
    private _context: ComponentFramework.Context<IInputs>;
    private _notifyOutputChanged: () => void;
    
    private _uploadInput: HTMLInputElement;
    private _processButton: HTMLButtonElement;
    private _downloadButton: HTMLButtonElement;
    private _copyButton: HTMLButtonElement;
    private _originalImage: HTMLImageElement;
    private _resultImage: HTMLImageElement;
    private _statusText: HTMLDivElement;
    private _loader: HTMLDivElement;
    
    private _originalImageData: string | null = null;
    private _resultImageData: string | null = null;
    
    // Default placeholder SVG
    private readonly DEFAULT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIvPgogIDxnPgogICAgPHRleHQgeD0iNTAlIiB5PSI0MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI0OCIgZmlsbD0iI2FhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+WvDwvdGV4dD4KICAgIDx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0PgogIDwvZz4KPC9zdmc+';

    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        this._context = context;
        this._container = container;
        this._notifyOutputChanged = notifyOutputChanged;
        
        this.renderUI();
        this.applyStyles();
    }

    private renderUI(): void {
        const wrapper = document.createElement("div");
        wrapper.className = "remove-bg-wrapper";
        
        // Upload Section
        const uploadSection = document.createElement("div");
        uploadSection.className = "remove-bg-section";
        
        this._uploadInput = document.createElement("input");
        this._uploadInput.type = "file";
        this._uploadInput.accept = "image/*";
        this._uploadInput.id = "fileInput";
        this._uploadInput.style.display = "none";
        this._uploadInput.addEventListener("change", this.handleFileSelect.bind(this));
        
        const uploadButton = document.createElement("button");
        uploadButton.className = "remove-bg-btn primary";
        uploadButton.textContent = this._context.parameters.UploadButtonText.raw || "Choose Image";
        uploadButton.addEventListener("click", () => this._uploadInput.click());
        
        this._processButton = document.createElement("button");
        this._processButton.className = "remove-bg-btn primary";
        this._processButton.textContent = this._context.parameters.ProcessButtonText.raw || "Remove Background";
        this._processButton.disabled = true;
        this._processButton.addEventListener("click", this.processImage.bind(this));
        
        uploadSection.appendChild(this._uploadInput);
        uploadSection.appendChild(uploadButton);
        uploadSection.appendChild(this._processButton);
        
        // Status
        this._statusText = document.createElement("div");
        this._statusText.className = "remove-bg-status";
        
        // Loader
        this._loader = document.createElement("div");
        this._loader.className = "remove-bg-loader";
        this._loader.style.display = "none";
        this._loader.innerHTML = '<div class="spinner"></div><p>Processing...</p>';
        
        // Images Container
        const imagesContainer = document.createElement("div");
        imagesContainer.className = "remove-bg-images";
        
        // Original Image
        const originalContainer = document.createElement("div");
        originalContainer.className = "remove-bg-image-container";
        const originalLabel = document.createElement("h3");
        originalLabel.textContent = "Original";
        this._originalImage = document.createElement("img");
        this._originalImage.className = "remove-bg-image";
        this._originalImage.alt = "Original image";
        this._originalImage.src = this.getPlaceholderImage();
        originalContainer.appendChild(originalLabel);
        originalContainer.appendChild(this._originalImage);
        
        // Result Image
        const resultContainer = document.createElement("div");
        resultContainer.className = "remove-bg-image-container";
        const resultLabel = document.createElement("h3");
        resultLabel.textContent = "Result";
        this._resultImage = document.createElement("img");
        this._resultImage.className = "remove-bg-image";
        this._resultImage.alt = "Result image";
        this._resultImage.src = this.getPlaceholderImage();
        resultContainer.appendChild(resultLabel);
        resultContainer.appendChild(this._resultImage);
        
        imagesContainer.appendChild(originalContainer);
        imagesContainer.appendChild(resultContainer);
        
        // Action Buttons
        const actionsSection = document.createElement("div");
        actionsSection.className = "remove-bg-actions";
        
        this._downloadButton = document.createElement("button");
        this._downloadButton.className = "remove-bg-btn secondary";
        this._downloadButton.textContent = this._context.parameters.DownloadButtonText.raw || "Download";
        this._downloadButton.disabled = true;
        this._downloadButton.addEventListener("click", this.downloadImage.bind(this));
        
        this._copyButton = document.createElement("button");
        this._copyButton.className = "remove-bg-btn secondary";
        this._copyButton.textContent = this._context.parameters.CopyButtonText.raw || "Copy Image";
        this._copyButton.disabled = true;
        this._copyButton.addEventListener("click", this.copyImage.bind(this));
        
        actionsSection.appendChild(this._downloadButton);
        actionsSection.appendChild(this._copyButton);
        
        // Append all
        wrapper.appendChild(uploadSection);
        wrapper.appendChild(this._statusText);
        wrapper.appendChild(this._loader);
        wrapper.appendChild(imagesContainer);
        wrapper.appendChild(actionsSection);
        
        this._container.appendChild(wrapper);
    }

    private getPlaceholderImage(): string {
        const customPlaceholder = this._context.parameters.PlaceholderImage.raw;
        return customPlaceholder || this.DEFAULT_PLACEHOLDER;
    }

    private applyStyles(): void {
        const root = this._container.querySelector('.remove-bg-wrapper') as HTMLElement;
        if (root) {
            root.style.backgroundColor = this._context.parameters.BackgroundColor.raw || "#ffffff";
            root.style.borderColor = this._context.parameters.BorderColor.raw || "#e0e0e0";
            root.style.fontSize = (this._context.parameters.FontSize.raw || 14) + "px";
            root.style.height = (this._context.parameters.ComponentHeight.raw || 600) + "px";
        }
        
        const primaryButtons = this._container.querySelectorAll('.remove-bg-btn.primary');
        primaryButtons.forEach((btn: Element) => {
            const button = btn as HTMLElement;
            button.style.backgroundColor = this._context.parameters.PrimaryColor.raw || "#0078d4";
            button.style.color = this._context.parameters.ButtonTextColor.raw || "#ffffff";
        });
        
        const secondaryButtons = this._container.querySelectorAll('.remove-bg-btn.secondary');
        secondaryButtons.forEach((btn: Element) => {
            const button = btn as HTMLElement;
            button.style.backgroundColor = this._context.parameters.SecondaryColor.raw || "#106ebe";
            button.style.color = this._context.parameters.ButtonTextColor.raw || "#ffffff";
        });
    }

    private handleFileSelect(event: Event): void {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            const file = target.files[0];
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.showStatus("Please select a valid image file", "error");
                return;
            }
            
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                this.showStatus("File size must not exceed 10MB", "error");
                return;
            }
            
            // Read and display original image
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                this._originalImageData = e.target?.result as string;
                this._originalImage.src = this._originalImageData;
                this._processButton.disabled = false;
                this._resultImage.src = this.getPlaceholderImage();
                this._downloadButton.disabled = true;
                this._copyButton.disabled = true;
                this._resultImageData = null;
                this.showStatus("Image loaded successfully. Click 'Remove Background' to process.", "success");
            };
            reader.readAsDataURL(file);
        }
    }

    private async processImage(): Promise<void> {
        if (!this._uploadInput.files || !this._uploadInput.files[0]) {
            this.showStatus("Please select an image first", "error");
            return;
        }

        const apiKey = this._context.parameters.ApiKey.raw;
        if (!apiKey) {
            this.showStatus("API Key not configured. Please add API Key to properties.", "error");
            return;
        }

        this.showLoader(true);
        this.showStatus("Processing image...", "info");
        this._processButton.disabled = true;
        this._downloadButton.disabled = true;
        this._copyButton.disabled = true;
        
        try {
            const myHeaders = new Headers();
            myHeaders.append("X-Api-Key", apiKey);
            
            const formdata = new FormData();
            formdata.append("image_file", this._uploadInput.files[0]);
            formdata.append("size", "auto");
            
            const requestOptions: RequestInit = {
                method: "POST",
                headers: myHeaders,
                body: formdata,
                redirect: "follow"
            };
            
            const response = await fetch("https://api.remove.bg/v1.0/removebg", requestOptions);
            
            if (!response.ok) {
                let errorMessage = `API Error: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.errors?.[0]?.title || errorMessage;
                } catch {
                    errorMessage = await response.text();
                }
                throw new Error(errorMessage);
            }
            
            const blob = await response.blob();
            
            // Convert blob to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                this._resultImageData = reader.result as string;
                this._resultImage.src = this._resultImageData;
                this._downloadButton.disabled = false;
                this._copyButton.disabled = false;
                this.showStatus("✅ Background removed successfully!", "success");
                this.showLoader(false);
                this._processButton.disabled = false;
                
                // Notify Power Apps
                this._notifyOutputChanged();
            };
            reader.readAsDataURL(blob);
            
        } catch (error) {
            console.error("Error:", error);
            this.showStatus(`❌ Error: ${(error as Error).message}`, "error");
            this.showLoader(false);
            this._processButton.disabled = false;
        }
    }

    private downloadImage(): void {
        if (!this._resultImageData) {
            this.showStatus("No image to download", "error");
            return;
        }
        
        const link = document.createElement('a');
        link.href = this._resultImageData;
        link.download = `removed-bg-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showStatus("✅ Image downloaded successfully!", "success");
    }

    private async copyImage(): Promise<void> {
        if (!this._resultImageData) {
            this.showStatus("No image to copy", "error");
            return;
        }
        
        try {
            // Convert base64 to blob
            const response = await fetch(this._resultImageData);
            const blob = await response.blob();
            
            // Copy to clipboard
            await navigator.clipboard.write([
                new ClipboardItem({ [blob.type]: blob })
            ]);
            
            this.showStatus("✅ Image copied to clipboard!", "success");
        } catch (error) {
            console.error("Copy error:", error);
            this.showStatus("⚠️ Failed to copy image. Your browser may not support this feature.", "error");
        }
    }

    private showStatus(message: string, type: "success" | "error" | "info"): void {
        this._statusText.textContent = message;
        this._statusText.className = `remove-bg-status ${type}`;
        this._statusText.style.display = "block";
        
        // Auto hide after 5 seconds for non-error messages
        if (type !== "error") {
            setTimeout(() => {
                this._statusText.style.display = "none";
            }, 5000);
        }
    }

    private showLoader(show: boolean): void {
        this._loader.style.display = show ? "flex" : "none";
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this._context = context;
        this.applyStyles();
        
        // Update placeholder if changed
        if (!this._originalImageData) {
            this._originalImage.src = this.getPlaceholderImage();
        }
        if (!this._resultImageData) {
            this._resultImage.src = this.getPlaceholderImage();
        }
        
        // Update button texts if changed
        const uploadBtn = this._container.querySelector('.remove-bg-section button:first-of-type') as HTMLButtonElement;
        if (uploadBtn) {
            uploadBtn.textContent = context.parameters.UploadButtonText.raw || "Choose Image";
        }
        
        if (this._processButton) {
            this._processButton.textContent = context.parameters.ProcessButtonText.raw || "Remove Background";
        }
        
        if (this._downloadButton) {
            this._downloadButton.textContent = context.parameters.DownloadButtonText.raw || "Download";
        }
        
        if (this._copyButton) {
            this._copyButton.textContent = context.parameters.CopyButtonText.raw || "Copy Image";
        }
    }

    public getOutputs(): IOutputs {
        return {
            ResultImage: this._resultImageData || undefined
        };
    }

    public destroy(): void {
        // Cleanup event listeners
        if (this._uploadInput) {
            this._uploadInput.removeEventListener("change", this.handleFileSelect);
        }
    }
}