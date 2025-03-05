{
    description = "clock-mate extension development environment";

    inputs = {
        nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
        flake-utils.url = "github:numtide/flake-utils";
    };

    outputs = {
        nixpkgs,
        flake-utils,
        ...
    }: flake-utils.lib.eachDefaultSystem (system: let
            pkgs = import nixpkgs {inherit system;};
        in {
            devShells.default = pkgs.mkShell {
                buildInputs = with pkgs; [
                    nodejs_22
                ];
                shellHook = ''
                    node --version > .nvmrc
                '';
            };
        });
}
