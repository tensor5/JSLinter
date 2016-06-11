_jslint()
{
    local cur
    COMPREPLY=()
    cur="${COMP_WORDS[COMP_CWORD]}"

    bool_opts=(
        bitwise
        browser
        couch
        devel
        es6
        eval
        for
        fudge
        multivar
        node
        single
        this
        white
    )

    numeric_opts=(
        maxerr=
        maxlen=
    )

    flags=(
        raw
        sha-bang
        version
    )

    if [[ "${cur}" == -* ]]; then
        COMPREPLY=(
            $(compgen -W "${bool_opts[*]/#/--} ${numeric_opts[*]/#/--} ${flags[*]/#/--}" -- "${cur}")
        )
        [[ ${COMPREPLY} == --@(maxerr|maxlen)= ]] && compopt -o nospace
        return 0
    else
        COMPREPLY=(
            $(compgen -f "${cur}")
        )
        return 0
    fi
}

complete -F _jslint jslint
