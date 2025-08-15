# Clockmate - Anzeigen der Überstunden per Erweiterung

Die Browser Erweiterung, die das aktuelle Gleitzeitkonto anzeigt. Man muss nicht mehr umständlich die Überstunden ausrechnen oder aus PDF-Datein ablesen. Es werden einfach im Fiori-Launchpad auf der Seite der Zeiterfassung die aktuellen Überstunden angezeigt.
<br><br>
*Das Gleitzeitkonto im Fiori-Launchpad:*
<br>
![Gleitzeitkonto im Fiori-Launchpad](./assets/gleitzeitkonto-fiorilaunchpad.png)

> ### 🚨 Disclaimer
> Dies ist **keine offizielle Software** und auch nicht in irgendeiner Form mit Fiori oder SAP verbunden! Es gibt **keine Gewährleistung** für die Richtigkeit der Überstunden!

# Installation
Die Erweiterung muss im entsprechenden Browser installiert werden:
- [Installation Firefox](https://github.com/clock-mate/extension/wiki/Firefox-Installation)
- [Installation Chrome](https://chromewebstore.google.com/detail/gleitzeitkonto-browser/pfafglenejhimeinpohlpdobpnmocddj)
- [Installation Edge](https://microsoftedge.microsoft.com/addons/detail/ionekooopielnnakholllacpgnlkjikm)

*Probleme? Erstelle ein [Issue](https://github.com/clock-mate/extension/issues)*

## Installation via Nix

Das Projekt muss in die `inputs` der `flake.nix` aufgenommen werden, in der sich die `home-manager`-Konfiguration befindet:

```nix
{
    inputs = {
        # ...
        clock-mate.url = "github:clock-mate/extension";
        # Optional:
        # clock-mate.inputs.nixpkgs.follows = "nixpkgs";
        # clock-mate.inputs.flake-utils.follows = "flake-utils";
    };
}
```

Anschließend kann das Paket zur `extensions`-Liste hinzugefügt werden.

Beispiel `home.nix`:
```nix
{inputs, pkgs, ...}: {
    # ...
    programs.firefox.profiles.<profile-name>.extensions.packages = [
        inputs.clock-mate.packages.${pks.system}.default
    ];
}
```

# Deinstallation
Zum Deinstallieren von Gleitzeitkonto-Browser die Erweiterung einfach entfernen:
- [Deinstallation Firefox](https://support.mozilla.org/de/kb/addons-deaktivieren-oder-deinstallieren)
- [Deinstallation Chrome](https://support.google.com/chrome_webstore/answer/2664769?hl=de)
- [Deinstallation Edge](https://support.microsoft.com/de-de/microsoft-edge/erweiterungen-in-microsoft-edge-hinzuf%C3%BCgen-ausschalten-oder-entfernen-9c0ec68c-2fbc-2f2c-9ff0-bdc76f46b026)

## Deinstallation vor V3
In älteren Versionen musste zusätzlich ein Programm (CompanionApp) und Node.js installiert werden. Zum Deinstallieren folgende Schritte befolgen:
1. Die Erweiterung aus dem Browser entfernen (siehe oben)
2. Das [Deinstallations-Skript](https://github.com/clock-mate/extension/releases/download/v2.0.1/uninstall_Gleitzeitkonto-Browser-GUI.hta) herunterladen und ausführen.<br>
3. (optional) Node.js deinstallieren

# Funktionsweise

Da die Browser Erweiterung Zugriff auf den Kontext von Fiori hat, kann diese auch Anfragen direkt an den Fiori-Server schicken. Es wird somit eine Anfrage geschickt, um die Arbeitszeiten abzufragen. Aus den Arbeitszeiten werden im Hintergrund die aktuellen Überstunden berechnet. Diese werden dann in der Erweiterung angezeigt.

# Idee
Die Projektidee zum Anzeigen eines Gleitzeitkontos (ehemalig Gleitzeitkonto-Browser sowie -API und -Desktop) ist entstanden, da es keine einfache Möglichkeit gab, die Überstunden einzusehen. Dies ist relevant, wenn man in manchen Wochen mehr als die geforderte Wochenstundenzahl arbeitet und in der anderen Woche entsprechend weniger arbeiten möchte.
