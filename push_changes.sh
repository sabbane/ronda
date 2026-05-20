#!/bin/bash
set -e

VERSION=$1

# 1. Status prüfen
if [ -n "$(git status --porcelain)" ]; then
    echo -e "\e[36mÄnderungen gefunden. Staging läuft...\e[0m"
    git add .

    # Nach Commit-Nachricht fragen
    echo -n "Bitte eine Commit-Nachricht eingeben (Standard: 'chore: update changes'): "
    read -r commitMsg
    if [ -z "$commitMsg" ]; then
        commitMsg="chore: update changes"
    fi

    echo -e "\e[36mCommit wird erstellt: '$commitMsg'...\e[0m"
    git commit -m "$commitMsg"
else
    echo -e "\e[33mKeine lokalen Änderungen zum Committen vorhanden.\e[0m"
fi

# 2. Version erstellen oder nur pushen
if [ -n "$VERSION" ]; then
    # Bereinige Versionsnummer
    VERSION=$(echo "$VERSION" | tr -d '"' | tr -d "'" | xargs)
    
    echo -e "\e[36mErstelle Version $VERSION...\e[0m"
    npm version "$VERSION"

    echo -e "\e[36mPushe main Branch und Tags zu origin...\e[0m"
    git push origin main
    git push origin --tags
else
    echo -e "\e[36mKeine Versionsnummer übergeben. Pushe Änderungen auf main zu origin...\e[0m"
    git push origin main
fi

echo -e "\e[32mErfolgreich abgeschlossen!\e[0m"
