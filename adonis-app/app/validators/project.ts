import vine from '@vinejs/vine'

export const ProjectValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(2).maxLength(100),
        path: vine.string().trim().minLength(1).maxLength(255),
        git_url: vine.string().trim().minLength(3).maxLength(255).transform((v) => {
            // Si URL dans le format suivant : git@github.com:WACOMS/test-portainer.git
            // Alors la transformer en : https://github.com/WACOMS/test-portainer.git
            if (/^git@github\.com:(.+)\.git$/.test(v)) {
                return v.replace(/^git@github\.com:(.+)\.git$/, 'https://github.com/$1.git')
            }
            return v
        }),
        branch: vine.string().trim().minLength(2).maxLength(100),
        before_pull_command: vine.string().trim().minLength(2).maxLength(255).optional(),
        after_pull_command: vine.string().trim().minLength(2).maxLength(255).optional(),
        restart_command: vine.string().trim().minLength(2).maxLength(255),
        webhook_secret: vine.string().trim().minLength(2).maxLength(255),
    })
)