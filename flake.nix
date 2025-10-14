# ~/path/to/your/corewriter-trace/flake.nix
{
  description = "Development environment for CoreWriter Trace";

  # Define the inputs for this flake, primarily the Nix Packages collection.
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable"; # Or use a specific version
  };

  # Define the outputs of this flake.
  outputs = { self, nixpkgs, ... }:
    let
      # Use the x86_64-linux system for our packages.
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in
    {
      # The 'devShell' is the environment you enter with `nix develop`.
      devShells.${system}.default = pkgs.mkShell {
        # Add the packages required by your project's README.
        buildInputs = [
          # The README recommends Node.js 20+ and pnpm 9.15+
          pkgs.nodejs-20_x  # Provides Node.js and npm
          pkgs.pnpm         # Provides pnpm
        ];
      };
    };
}
