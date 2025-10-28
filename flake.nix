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
    }:
        flake-utils.lib.eachDefaultSystem (system: let
            pkgs = import nixpkgs {inherit system;};
            buildInputs = with pkgs; [
                nodejs_22
            ];
        in {
            devShells.default = pkgs.mkShell {
                inherit buildInputs;
                shellHook = ''
                    node --version > .nvmrc
                '';
            };
            packages.default = let
                inherit (pkgs.lib) makeOverridable licenses platforms pipe;
                inherit (builtins) elemAt fromJSON length readFile;
                buildFirefoxXpiAddon = makeOverridable ({
                    stdenv ? pkgs.stdenv,
                    fetchurl ? pkgs.fetchurl,
                    pname,
                    version,
                    addonId,
                    url,
                    sha256,
                    meta,
                    ...
                }:
                    stdenv.mkDerivation {
                        name = "${pname}-${version}";

                        inherit meta;

                        src = fetchurl {inherit url sha256;};

                        preferLocalBuild = true;
                        allowSubstitutes = true;

                        passthru = {inherit addonId;};

                        buildCommand = ''
                            dst="$out/share/mozilla/extensions/{ec8030f7-c20a-464f-9b0e-13a3a9e97384}"
                            mkdir -p "$dst"
                            install -v -m644 "$src" "$dst/${addonId}.xpi"
                        '';
                    });
                manifest = fromJSON (readFile ./src/extension/manifest.json);
                addonId = manifest.browser_specific_settings.gecko.id;
                latestUpdate = pipe ./update/updates.json [
                    readFile
                    fromJSON
                    (u: let inherit (u.addons.${addonId}) updates; in elemAt updates (length updates - 1))
                ];
            in
                buildFirefoxXpiAddon {
                    inherit addonId;
                    inherit (latestUpdate) version sha256;
                    pname = manifest.name;
                    url = latestUpdate.update_link;
                    meta = {
                        inherit (manifest) description;
                        homepage = manifest.homepage_url;
                        license = licenses.mit;
                        mozPermissions = manifest.permissions ++ manifest.host_permissions;
                        platforms = platforms.all;
                    };
                };
        });
}
