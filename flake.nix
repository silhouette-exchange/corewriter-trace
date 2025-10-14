# ~/path/to/your/corewriter-trace/flake.nix
{
  description = "Development environment for CoreWriter Trace";

  # --- STEP 1: Add the nix-ai-tools input ---
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    nix-ai-tools.url = "github:numtide/nix-ai-tools"; # <-- ADD THIS LINE
  };

  # --- STEP 2: Pass the new input to the outputs function ---
  outputs = { self, nixpkgs, nix-ai-tools, ... }: # <-- ADD nix-ai-tools HERE
    let
      # This system variable is fine for your EC2 instance.
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        # --- STEP 3: Add the gemini-cli package ---
        buildInputs = [
          # Project dependencies
          pkgs.nodejs_20
          pkgs.pnpm

          # Add gemini-cli from the nix-ai-tools flake
          nix-ai-tools.packages.${system}.gemini-cli # <-- ADD THIS LINE
        ];
      };
    };
}
