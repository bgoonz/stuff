(*
 * Copyright (c) 2017, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the "hack" directory of this source tree.
 *
 *)

(*
 * FUTURE IMPROVEMENTS:
 * - Order suggestions by how likely they are to be what the programmer
 *   wishes to do, not just what is valid
 *)

open FfpAutocompleteContextParser
open FfpAutocompleteContextParser.Container
open FfpAutocompleteContextParser.Predecessor
open FfpAutocompleteContextParser.ContextPredicates
open Hh_prelude

(* Each keyword completion object has a list of keywords and a function that
   takes a context and returns whether or not the list of keywords is valid
   in that context. *)
type keyword_completion = {
  keywords: string list;
  is_valid_in_context: context -> bool;
}

let abstract_keyword =
  {
    keywords = ["abstract"];
    is_valid_in_context =
      begin
        fun context ->
        (* Abstract class *)
        is_top_level_statement_valid context
        (* Abstract method *)
        || is_class_body_declaration_valid context
        || is_trait_body_declaration_valid context
      end;
  }

let final_keyword =
  {
    keywords = ["final"];
    is_valid_in_context =
      begin
        fun context ->
        (* Final class *)
        is_top_level_declaration_or_kwabstract context.predecessor
        || is_top_level_statement_valid context
        (* Final method *)
        || is_class_body_declaration_valid context
        || is_trait_body_declaration_valid context
        || (* Final after other modifiers *)
        is_class_body context.closest_parent_container
        && is_visibility_mod_or_kwstatic context.predecessor
      end;
  }

let implements_keyword =
  {
    keywords = ["implements"];
    is_valid_in_context =
      begin
        fun context ->
        (* Class implements interface *)
        is_class_header_body context.closest_parent_container
        && is_class_name_or_extends_list context.predecessor
        || (* "require implements" inside a trait *)
        is_trait_body context.closest_parent_container
        && is_kwrequire context.predecessor
      end;
  }

let extends_keyword =
  {
    keywords = ["extends"];
    is_valid_in_context =
      begin
        fun context ->
        is_interface_or_class_header_or_body context.closest_parent_container
        && is_class_name context.predecessor
        || (* Inside trait/interface body *)
        is_trait_interface_body context.closest_parent_container
        && is_kwrequire context.predecessor
      end;
  }

let visibility_modifiers =
  {
    keywords = ["public"; "protected"; "private"];
    is_valid_in_context =
      begin
        fun context ->
        is_class_body_declaration_valid context
        || is_trait_body_declaration_valid context
        || is_class_body context.closest_parent_container
           && is_kwfinal context.predecessor
      end;
  }

let interface_visibility_modifiers =
  {
    keywords = ["public"];
    is_valid_in_context = is_interface_body_declaration_valid;
  }

let static_keyword =
  {
    keywords = ["static"];
    is_valid_in_context =
      begin
        fun context ->
        is_class_body_declaration_valid context
        || is_interface_body_declaration_valid context
        || is_trait_body_declaration_valid context
        || is_body context.closest_parent_container
           && is_visibility_modifier context.predecessor
      end;
  }

let async_keyword =
  {
    keywords = ["async"];
    is_valid_in_context =
      begin
        fun context ->
        (* Async method *)
        is_class_body_declaration_valid context
        || is_trait_body_declaration_valid context
        (* Async method after modifiers *)
        || is_class_trait_body context.closest_parent_container
           && is_visibility_mod_kwfinal_or_kwstatic context.predecessor
        (* Async top level function *)
        || is_top_level_statement_valid context
        || (* Async lambda *)
        is_expression_valid context
      end;
  }

let const_keyword =
  {
    keywords = ["const"];
    is_valid_in_context =
      begin
        fun context ->
        is_class_body_declaration_valid context
        || is_interface_body_declaration_valid context
      end;
  }

let use_keyword =
  {
    keywords = ["use"];
    is_valid_in_context =
      begin
        fun context ->
        (* use <trait> inside body *)
        is_class_body_declaration_valid context
        || (* use <namespace> at top level *)
        is_top_level_statement_valid context
        (* TODO: "use" for closures *)
      end;
  }

let function_keyword =
  {
    keywords = ["function"];
    is_valid_in_context =
      begin
        fun context ->
        (* Class Method *)
        (* "function" is not valid without a visibility modifier, but we still suggest it here since a
           user may wish to write the function before adding the modifier. *)
        is_class_body_declaration_valid context
        || is_interface_body_declaration_valid context
        || is_trait_body_declaration_valid context
        (* Class method, after modifiers *)
        || is_body_or_function_header context.closest_parent_container
           && is_visibility_mod_kwasync_kwfinal_or_kwstatic context.predecessor
        (* Top level function *)
        || is_top_level_statement_valid context
        || (* Top level async function *)
        is_top_level context.closest_parent_container
        && is_kwasync context.predecessor
      end;
  }

let class_keyword =
  {
    keywords = ["class"];
    is_valid_in_context =
      begin
        fun context ->
        is_top_level_statement_valid context
        || is_class_header context.closest_parent_container
           && is_kwabstract_or_kwfinal context.predecessor
      end;
  }

let interface_keyword =
  {
    keywords = ["interface"];
    is_valid_in_context =
      begin
        fun context ->
        is_top_level_statement_valid context
      end;
  }

let require_constraint_keyword =
  {
    keywords = ["require"];
    is_valid_in_context =
      begin
        fun context ->
        (* Require inside trait body or interface body *)
        is_trait_interface_body context.closest_parent_container
        && is_left_brace_or_class_body_decl context.predecessor
      end;
  }

let declaration_keywords =
  {
    keywords =
      [
        "enum";
        "require";
        "include";
        "require_once";
        "include_once";
        "namespace";
        "newtype";
        "trait";
        "type";
      ];
    is_valid_in_context =
      begin
        fun context ->
        is_top_level_statement_valid context
      end;
  }

let void_keyword =
  {
    keywords = ["void"];
    is_valid_in_context =
      begin
        fun context ->
        is_function_header context.closest_parent_container
        && is_colon_or_less_than context.predecessor
      end;
  }

let noreturn_keyword =
  {
    keywords = ["noreturn"];
    is_valid_in_context =
      begin
        fun context ->
        is_class_body_or_function_header context.closest_parent_container
        && is_colon context.predecessor
      end;
  }

let primitive_types =
  {
    keywords =
      [
        "array";
        "arraykey";
        "bool";
        "classname";
        "darray";
        "float";
        "int";
        "mixed";
        "num";
        "string";
        "resource";
        "varray";
        "nothing";
      ];
    is_valid_in_context = is_type_valid;
  }

let this_type_keyword =
  {
    keywords = ["this"; "?this"];
    is_valid_in_context =
      begin
        fun context ->
        is_function_header context.closest_parent_container
        && is_colon context.predecessor
        && context.inside_class_body
      end;
  }

let loop_body_keywords =
  {
    keywords = ["continue"; "break"];
    is_valid_in_context =
      begin
        fun context ->
        context.inside_loop_body && is_at_beginning_of_new_statement context
      end;
  }

let switch_body_keywords =
  {
    keywords = ["case"; "default"; "break"];
    is_valid_in_context =
      begin
        fun context ->
        context.inside_switch_body && is_at_beginning_of_new_statement context
      end;
  }

let async_func_body_keywords =
  {
    keywords = ["await"];
    is_valid_in_context =
      begin
        fun context ->
        context.inside_async_function
        && is_compound_statement_or_assignment_expression
             context.closest_parent_container
      end;
  }

(*
 * TODO: Figure out what exactly a postfix expression is and when one is valid
 * or more importantly, invalid.
 *)
let postfix_expressions =
  {
    keywords = ["clone"; "new"];
    is_valid_in_context =
      begin
        fun context ->
        is_expression_valid context
      end;
  }

let general_statements =
  {
    keywords =
      [
        "if";
        "do";
        "while";
        "for";
        "foreach";
        "try";
        "return";
        "throw";
        "switch";
        "yield";
        "echo";
      ];
    is_valid_in_context =
      begin
        fun context ->
        is_at_beginning_of_new_statement context
      end;
  }

let if_after_else =
  {
    keywords = ["if"];
    is_valid_in_context =
      begin
        fun context ->
        is_kwelse context.predecessor
        && is_compound_statement_or_if context.closest_parent_container
      end;
  }

let if_trailing_keywords =
  {
    keywords = ["else"; "else if"];
    is_valid_in_context =
      begin
        fun context ->
        is_if_without_else context.predecessor
        && is_compound_statement context.closest_parent_container
      end;
  }

let try_trailing_keywords =
  {
    keywords = ["catch"; "finally"];
    is_valid_in_context =
      begin
        fun context ->
        is_try_without_finally context.predecessor
        && is_compound_statement context.closest_parent_container
      end;
  }

let primary_expressions =
  {
    keywords = ["tuple"; "shape"; "null"];
    is_valid_in_context =
      begin
        fun context ->
        is_expression_valid context
      end;
  }

let scope_resolution_qualifiers =
  {
    keywords = ["self"; "parent"; "static"];
    is_valid_in_context =
      begin
        fun context ->
        is_expression_valid context
      end;
  }

let keyword_matches : keyword_completion list =
  [
    abstract_keyword;
    async_keyword;
    async_func_body_keywords;
    class_keyword;
    const_keyword;
    declaration_keywords;
    extends_keyword;
    final_keyword;
    function_keyword;
    general_statements;
    if_after_else;
    if_trailing_keywords;
    implements_keyword;
    interface_keyword;
    interface_visibility_modifiers;
    loop_body_keywords;
    noreturn_keyword;
    postfix_expressions;
    primary_expressions;
    primitive_types;
    require_constraint_keyword;
    scope_resolution_qualifiers;
    static_keyword;
    switch_body_keywords;
    this_type_keyword;
    try_trailing_keywords;
    use_keyword;
    visibility_modifiers;
    void_keyword;
  ]

let autocomplete_keyword (context : context) : string list =
  let check_keyword_match { keywords; is_valid_in_context } =
    Option.some_if (is_valid_in_context context) keywords
  in
  keyword_matches |> List.filter_map ~f:check_keyword_match |> List.concat
