#!/bin/bash
set -e

USER=deploy
SSH_DIR=/home/$USER/.ssh
AUTO_MODE=false

warn()    { echo -e "\033[1;33m[WARN]\033[0m $1"; }
error()   { echo -e "\033[1;31m[ERROR]\033[0m $1"; }

ask() {
    if $AUTO_MODE; then
        return 0
    fi
    clear
    while true; do
        read -p "$(echo -e "\033[1;36m[?]\033[0m $1 [y/N] : ")" yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* | "" ) return 1;;
            * ) echo "Répondez par o (oui) ou n (non).";;
        esac
    done
}

if [[ "$1" == "--auto" ]]; then
    AUTO_MODE=true
fi

if ! id "$USER" &>/dev/null; then
    if ask "Créer l'utilisateur '$USER' ?"; then
        sudo adduser --disabled-password --gecos "" $USER
    else
        error "Utilisateur '$USER' absent. Arrêt du script."
        exit 1
    fi
else
    warn "Utilisateur '$USER' déjà existant."
fi

if ask "Ajouter '$USER' au groupe docker ?"; then
    sudo usermod -aG docker $USER
fi

if ask "Installer et configurer openssh-server sur la machine hôte ?"; then
    sudo apt-get update && sudo apt-get install -y openssh-server
    sudo sed -i 's/^#ListenAddress 0.0.0.0/ListenAddress 0.0.0.0/' /etc/ssh/sshd_config
    sudo systemctl enable ssh
    sudo systemctl restart ssh
fi

if ask "Créer et configurer le répertoire .ssh ?"; then
    sudo mkdir -p $SSH_DIR
    sudo chmod 700 $SSH_DIR
    sudo chown $USER:$USER $SSH_DIR
fi

if [ ! -f "$SSH_DIR/id_rsa" ]; then
    if ask "Générer une nouvelle paire de clés SSH ?"; then
        sudo -u $USER ssh-keygen -t rsa -b 4096 -m PEM -f $SSH_DIR/id_rsa -N ""
    else
        warn "Clé SSH non générée."
    fi
else
    warn "Clé SSH déjà présente."
    if ask "Régénérer la clé SSH (écrasement) ?"; then
        sudo rm -f $SSH_DIR/id_rsa $SSH_DIR/id_rsa.pub
        sudo -u $USER ssh-keygen -t rsa -b 4096 -m PEM -f $SSH_DIR/id_rsa -N ""
    fi
fi

if ask "Ajouter la clé publique à authorized_keys ?"; then
    sudo sh -c "cat $SSH_DIR/id_rsa.pub >> $SSH_DIR/authorized_keys"
    sudo chmod 600 $SSH_DIR/authorized_keys
    sudo chown $USER:$USER $SSH_DIR/authorized_keys
fi

if ask "Configurer les droits sudo pour '$USER' ?"; then
    echo "$USER ALL=(ALL) NOPASSWD:/usr/bin/git,/usr/bin/docker,/usr/local/bin/docker-compose" | sudo tee /etc/sudoers.d/deploy > /dev/null
fi