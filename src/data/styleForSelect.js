import {styleInputWithoutRounded} from "./styles";

const targetHeight = 28;

export const CustomStyle = {
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected ? "rgb(156 163 175)" : state.isFocused ? "rgb(29 78 216)" : "",
        color: state.isSelected ? "rgb(255 255 255)" : state.isFocused ? "rgb(255 255 255)" : "",
        height: "auto",
        // whiteSpace: "nowrap",
        zIndex: '100',
        fontSize: '12px', lineHeight: '12px'

    }),
    control: (base, state) => ({
        ...base,
        minHeight: 'initial',
        height: "auto",
        borderRadius: "4px",
        borderWidth: "1px",
        borderColor: "rgb(148 163 184)",
        // boxShadow: state.isFocused ?  "0px 0px 0px 1px rgb(29 78 216)" : "none",
        boxShadow: "none",
        outline: state.isFocused ? "auto":"0",
        outlineColor: "rgb(29 78 216)",


        ':hover': {
            // borderWidth: "2px",
            borderColor: "rgb(29 78 216)",
        },


    }),
    noOptionsMessage: (base, state) => ({
        ...base,
        height: "20px",
        lineHeight: '12px',
        fontSize: '12px',
    }),
    loadingMessage: (base, state) => ({
        ...base,
        height: "25px",
        lineHeight: '10px',
        fontSize: '12px',
    }),

    //уменьшение размеров
    valueContainer: (base) => ({
        ...base,
        height: `${targetHeight - 1 - 1}px`,
        padding: '0 8px',
    }),
    clearIndicator: (base) => ({
        ...base,
        padding: `${(targetHeight - 20 - 1 - 1) / 2}px`,
    }),
    dropdownIndicator: (base) => ({
        ...base,
        padding: `${(targetHeight - 20 - 1 - 1) / 2}px`,
    }),


}

export const CustomStyleWithoutRounded = {
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected ? "rgb(156 163 175)" : state.isFocused ? "rgb(29 78 216)" : "",
        color: state.isSelected ? "rgb(255 255 255)" : state.isFocused ? "rgb(255 255 255)" : "",
        height: "auto",
        // whiteSpace: "nowrap",
        zIndex: '100',
        // position: "relative",
        fontSize: '12px', lineHeight: '12px'

    }),
    control: (base, state) => ({
        ...base,
        minHeight: 'initial',
        height: "auto",
        borderRadius: "0px",
        borderWidth: "1.2px",
        borderColor: "rgb(148 163 184)",
        // boxShadow: state.isFocused ?  "0px 0px 0px 1px rgb(29 78 216)" : "none",
        boxShadow: "none",
        outline: state.isFocused ? "auto":"0",
        outlineColor: "rgb(29 78 216)",


        ':hover': {
            // borderWidth: "2px",
            borderColor: "rgb(29 78 216)",
        },


    }),
    noOptionsMessage: (base, state) => ({
        ...base,
        height: "20px",
        lineHeight: '12px',
        fontSize: '12px',
    }),
    loadingMessage: (base, state) => ({
        ...base,
        height: "25px",
        lineHeight: '10px',
        fontSize: '12px',
    }),

    //уменьшение размеров
    valueContainer: (base) => ({
        ...base,
        height: `${targetHeight - 1 - 1}px`,
        padding: '0 8px',
    }),
    clearIndicator: (base) => ({
        ...base,
        padding: `${(targetHeight - 20 - 1 - 1) / 2}px`,
    }),
    dropdownIndicator: (base) => ({
        ...base,
        padding: `${(targetHeight - 20 - 1 - 1) / 2}px`,
    }),

    menu: (base) => ({
        ...base,
        zIndex: 9999, // Очень высокий z-index
        marginTop: '0px', // Убираем отступ
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    }),

    menuPortal: (base) => ({
        ...base,
        zIndex: 9999,
    }),

}